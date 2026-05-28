import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, CreditCard, CheckCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { ordersApi, paymentsApi, notificationsApi } from '../api/axios'
import toast from 'react-hot-toast'

// Load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function Checkout() {
  const { cart, getTotalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 0=review, 1=shipping, 2=payment
  const [address, setAddress] = useState({
    line1: '', city: '', state: '', pincode: '', country: 'India'
  })
  const [emailForEbook, setEmailForEbook] = useState(user?.email || '')
  const [loading, setLoading] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)

  const currentCart = Array.isArray(cart) ? cart : []
  const hasHardcopy = currentCart.some(item => item.itemType === 'HARDCOPY')
  const hasEbook = currentCart.some(item => item.itemType === 'EBOOK')
  const steps = [
    'Cart Review',
    hasHardcopy ? 'Shipping' : 'Delivery Email',
    'Payment'
  ]

  const subtotal = getTotalPrice()
  const gst = subtotal * 0.18
  const total = subtotal + gst

  const handleAddressSubmit = (e) => {
    e.preventDefault()
    setStep(2)
  }

  const handleRazorpayPayment = async () => {
    setLoading(true)
    try {
      // Step 1: Load Razorpay
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        toast.error('Failed to load Razorpay. Check your internet connection.')
        setLoading(false)
        return
      }

      // Step 2: Create Novello order
      let shippingAddress = ''
      if (hasHardcopy) {
        shippingAddress = `${address.line1}, ${address.city}, ${address.state} - ${address.pincode}, ${address.country}`
      } else {
        shippingAddress = `Digital eBook Delivery: ${emailForEbook}`
      }

      const orderRes = await ordersApi.create({
        userId: user.id,
        shippingAddress,
        items: currentCart.map(item => ({
          bookId: item.bookId,
          bookTitle: item.bookTitle,
          bookAuthor: item.bookAuthor,
          coverImageUrl: item.coverImageUrl,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          itemType: item.itemType,
        }))
      })
      const novelloOrder = orderRes.data

      // Step 3: Create Razorpay order via Payment Service
      const paymentOrderRes = await paymentsApi.createOrder({
        orderId: novelloOrder.id,
        userId: user.id,
        amount: total.toFixed(2),
        currency: 'INR'
      })
      const { razorpayOrderId, keyId, amount: razorpayAmount } = paymentOrderRes.data

      // Step 4: Open Razorpay Checkout modal
      if (keyId === 'mock' || razorpayOrderId.startsWith('order_mock_')) {
        toast('Simulating payment connection...', { icon: '💳' })
        setTimeout(async () => {
          try {
            const mockPaymentId = 'pay_mock_' + Math.random().toString(36).substring(2, 11)
            const mockSignature = 'sig_mock_' + Math.random().toString(36).substring(2, 11)

            const toastId = toast.loading('Processing simulated payment...')

            const verifyRes = await paymentsApi.verify({
              razorpayOrderId: razorpayOrderId,
              razorpayPaymentId: mockPaymentId,
              razorpaySignature: mockSignature,
              orderId: novelloOrder.id,
            })

            toast.dismiss(toastId)

            if (verifyRes.data.success) {
              // Send payment success notification
              try {
                await fetch('/api/notifications', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('novello_token')}`
                  },
                  body: JSON.stringify({
                    userId: user.id,
                    title: 'Payment Successful! 🎉',
                    message: `Your payment for order #${novelloOrder.orderNumber} was successful! (Simulated)`,
                    type: 'PAYMENT_SUCCESS',
                    referenceId: novelloOrder.id,
                    referenceType: 'ORDER'
                  })
                })
              } catch (e) { }

              setCompletedOrder({ ...novelloOrder, paymentId: mockPaymentId })
              setOrderSuccess(true)
              clearCart()
              toast.success('Payment successful! (Simulated Mode)')
            } else {
              toast.error('Payment verification failed.')
            }
          } catch (e) {
            toast.error('Payment verification error.')
          }
          setLoading(false)
        }, 1500)
        return
      }

      const options = {
        key: keyId,
        amount: razorpayAmount,
        currency: 'INR',
        name: 'Novello Bookstore',
        description: `Order #${novelloOrder.orderNumber}`,
        image: '',
        order_id: razorpayOrderId,
        prefill: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          contact: user.phone || '',
        },
        notes: {
          orderId: novelloOrder.id,
        },
        theme: {
          color: '#8b5cf6',
        },
        handler: async function (response) {
          // Step 5: Verify payment signature on backend
          try {
            const verifyRes = await paymentsApi.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: novelloOrder.id,
            })

            if (verifyRes.data.success) {
              // Send payment success notification
              try {
                await fetch('/api/notifications', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('novello_token')}`
                  },
                  body: JSON.stringify({
                    userId: user.id,
                    title: 'Payment Successful! 🎉',
                    message: `Your payment for order #${novelloOrder.orderNumber} was successful!`,
                    type: 'PAYMENT_SUCCESS',
                    referenceId: novelloOrder.id,
                    referenceType: 'ORDER'
                  })
                })
              } catch (e) { }

              setCompletedOrder({ ...novelloOrder, paymentId: response.razorpay_payment_id })
              setOrderSuccess(true)
              clearCart()
              toast.success('Payment successful! Order confirmed!')
            } else {
              toast.error('Payment verification failed. Contact support.')
            }
          } catch (e) {
            toast.error('Payment verification error. Please contact support.')
          }
          setLoading(false)
        },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled', { icon: 'ℹ️' })
            setLoading(false)
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.')
      setLoading(false)
    }
  }

  // ── Success Screen ────────────────────────────────────────────────
  if (orderSuccess && completedOrder) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 560 }}>
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)', border: '2px solid var(--success)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem', color: 'var(--success)'
            }}>
              <CheckCircle size={40} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--success)' }}>
              Order Confirmed!
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Payment successful. Your order <strong style={{ color: 'var(--text-primary)' }}>#{completedOrder.orderNumber}</strong> is confirmed.
            </p>
            {hasEbook && (
              <p style={{ color: 'var(--success)', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 500 }}>
                📩 A confirmation email with the download link has been sent to: <strong>{emailForEbook}</strong>
              </p>
            )}
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', marginBottom: '2rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Payment ID</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{completedOrder.paymentId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Amount Paid</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gold)' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/orders')} id="order-success-view-btn">
                View My Orders
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/catalog')}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '2rem' }}>Checkout</h1>

        {/* Steps */}
        <div className="checkout-steps" style={{ marginBottom: '2.5rem' }}>
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div className={`checkout-step ${step === i ? 'active' : step > i ? 'done' : ''}`}>
                <div className="checkout-step-num">
                  {step > i ? '✓' : i + 1}
                </div>
                <span style={{ marginLeft: '0.5rem' }}>{s}</span>
              </div>
              {i < steps.length - 1 && <div className="checkout-step-divider" />}
            </React.Fragment>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
          {/* Main Content */}
          <div>
            {/* Step 0: Review */}
            {step === 0 && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Review Your Items</h3>
                {currentCart.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.875rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1.75rem' }}>📚</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.bookTitle}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} × ₹{Number(item.unitPrice).toFixed(2)}</div>
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--gold)' }}>₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
                <button className="btn btn-primary" onClick={() => setStep(1)} style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }} id="step0-next-btn">
                  Continue to Shipping →
                </button>
              </div>
            )}

            {/* Step 1: Shipping and/or Email */}
            {step === 1 && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>
                  {hasHardcopy ? 'Shipping Address' : 'Digital eBook Delivery'}
                </h3>
                <form onSubmit={handleAddressSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                  {/* Shipping Address (Only for Hardcopy) */}
                  {hasHardcopy && (
                    <>
                      <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                        📦 Hardcopy Shipping Address
                      </h4>
                      <div className="form-group">
                        <label className="form-label" htmlFor="addr-line1">Address Line</label>
                        <input id="addr-line1" className="form-input" placeholder="Street / Apartment / Building"
                          value={address.line1} onChange={e => setAddress({ ...address, line1: e.target.value })} required />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label" htmlFor="addr-city">City</label>
                          <input id="addr-city" className="form-input" placeholder="Mumbai"
                            value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} required />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="addr-state">State</label>
                          <input id="addr-state" className="form-input" placeholder="Maharashtra"
                            value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} required />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label" htmlFor="addr-pincode">Pincode</label>
                          <input id="addr-pincode" className="form-input" placeholder="400001"
                            value={address.pincode} onChange={e => setAddress({ ...address, pincode: e.target.value })} required />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="addr-country">Country</label>
                          <input id="addr-country" className="form-input" value={address.country} readOnly />
                        </div>
                      </div>
                    </>
                  )}

                  {/* eBook Delivery Email (Only for eBook) */}
                  {!hasHardcopy && hasEbook && (
                    <div style={{ marginTop: hasHardcopy ? '1.5rem' : '0' }}>
                      {hasHardcopy && (
                        <>
                          <div className="divider" style={{ margin: '1rem 0' }} />
                          <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                            📩 eBook Digital Delivery
                          </h4>
                        </>
                      )}
                      <div className="form-group">
                        <label className="form-label" htmlFor="delivery-email">eBook Delivery Email</label>
                        <input id="delivery-email" type="email" className="form-input" placeholder="you@example.com"
                          value={emailForEbook} onChange={e => setEmailForEbook(e.target.value)} required />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Your eBook download link will be available instantly and sent to this email address upon payment confirmation.
                        </p>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setStep(0)}>
                      ← Back
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} id="step1-next-btn">
                      Continue to Payment →
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Payment</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  Complete your purchase securely with Razorpay
                </p>

                <div className="razorpay-section" style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💳</div>
                  <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Pay with Razorpay</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Supports UPI, Net Banking, Cards, Wallets & EMI
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {['UPI', 'Visa', 'Mastercard', 'Net Banking', 'Paytm', 'PhonePe'].map(method => (
                      <span key={method} className="badge badge-purple">{method}</span>
                    ))}
                  </div>
                  <div className="razorpay-logo-text">
                    🔒 Secured by Razorpay — PCI DSS Compliant
                  </div>
                </div>

                {/* Delivery Details Preview */}
                <div style={{ padding: '0.875rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  {hasHardcopy && (
                    <div>
                      <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        📦 Shipping to Address
                      </div>
                      <div>{address.line1}, {address.city}, {address.state} - {address.pincode}</div>
                    </div>
                  )}
                  {!hasHardcopy && hasEbook && (
                    <div>
                      <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        📩 eBook Delivery Email
                      </div>
                      <div>{emailForEbook}</div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                  <button
                    className="btn btn-gold"
                    style={{ flex: 1, justifyContent: 'center', padding: '0.875rem', fontSize: '1rem' }}
                    onClick={handleRazorpayPayment}
                    disabled={loading}
                    id="razorpay-pay-btn"
                  >
                    {loading ? (
                      <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                    ) : (
                      <>
                        <CreditCard size={20} /> Pay ₹{total.toFixed(2)} Now
                      </>
                    )}
                  </button>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', justifyContent: 'center' }}>
                  <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
                  Your payment info is encrypted and secure
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '90px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {currentCart.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }} className="text-truncate">{item.bookTitle} ×{item.quantity}</span>
                  <span>₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <span>GST (18%)</span><span>₹{gst.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <span>Shipping</span><span style={{ color: 'var(--success)' }}>Free</span>
              </div>
            </div>
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--gold)' }}>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
