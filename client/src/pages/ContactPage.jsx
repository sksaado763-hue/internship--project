import { useState } from 'react';
import { CircleCheck, Heading, Laptop, Mail, MailOpen, MessageSquareText, Network, Send, User } from 'lucide-react';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';

const CONTACT_EMAIL = 'havitgrowth@gmail.com';
// Free access key from web3forms.com — replace to start receiving form messages
const WEB3FORMS_ACCESS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY';

export default function ContactPage() {
  const [values, setValues] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const setField = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: values.name,
          email: values.email,
          subject: `Contact Form Subject: ${values.subject}`,
          message: values.message,
          from_name: 'HavitGrowth Contact Page',
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Submission failed');
      setStatus('sent');
    } catch {
      setStatus('idle');
      setError(`Something went wrong. Please try again, or email us directly at ${CONTACT_EMAIL}.`);
    }
  }

  function resetForm() {
    setValues({ name: '', email: '', subject: '', message: '' });
    setStatus('idle');
    setError('');
  }

  return (
    <div className="contact-page">
      <section className="contact-hero" aria-labelledby="contact-title">
        <div className="contact-dots" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
        <Badge tone="brand"><Mail size={14} aria-hidden="true" /> CONTACT SUPPORT</Badge>
        <h1 id="contact-title">Get in Touch With Us</h1>
        <p>Have questions, custom tool requests, or partnership ideas? Send us a message and we'll reply shortly.</p>
      </section>

      <section className="contact-layout page-container" aria-label="Contact information and message form">
        <div className="contact-info-column">
          <article className="contact-info-card">
            <span className="contact-info-icon contact-info-icon--brand"><MailOpen size={20} aria-hidden="true" /></span>
            <div>
              <h2>Email Us Directly</h2>
              <p>Response within 24 hours</p>
              <a className="contact-info-email" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </div>
          </article>

          <article className="contact-info-card">
            <span className="contact-info-icon contact-info-icon--indigo"><Laptop size={20} aria-hidden="true" /></span>
            <div>
              <h2>Request a Custom Tool</h2>
              <p>Suggest new developer APIs</p>
              <a className="contact-info-email contact-info-email--indigo" href={`mailto:${CONTACT_EMAIL}?subject=Custom tool request`}>{CONTACT_EMAIL}</a>
            </div>
          </article>

          <article className="contact-info-card">
            <span className="contact-info-icon contact-info-icon--green"><Network size={20} aria-hidden="true" /></span>
            <div>
              <h2>Global Developer Nodes</h2>
              <p>Run secure computations</p>
              <span className="contact-node-pill">100% Client-Side Node Active</span>
            </div>
          </article>
        </div>

        <div className="contact-form-card">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-field-row">
              <div className="contact-field">
                <label htmlFor="contact-name"><User size={11} aria-hidden="true" /> Full Name *</label>
                <input id="contact-name" name="name" type="text" required value={values.name} onChange={setField('name')} />
              </div>
              <div className="contact-field">
                <label htmlFor="contact-email"><Mail size={11} aria-hidden="true" /> Email Address *</label>
                <input id="contact-email" name="email" type="email" required value={values.email} onChange={setField('email')} />
              </div>
            </div>

            <div className="contact-field">
              <label htmlFor="contact-subject"><Heading size={11} aria-hidden="true" /> Subject *</label>
              <input id="contact-subject" name="subject" type="text" required value={values.subject} onChange={setField('subject')} />
            </div>

            <div className="contact-field">
              <label htmlFor="contact-message"><MessageSquareText size={11} aria-hidden="true" /> Message *</label>
              <textarea id="contact-message" name="message" rows={5} required placeholder="Write details here..." value={values.message} onChange={setField('message')} />
            </div>

            {error && <p className="contact-form-error" role="alert">{error}</p>}

            <Button type="submit" variant="primary" className="contact-submit" disabled={status === 'sending'}>
              <Send size={14} aria-hidden="true" /> {status === 'sending' ? 'Sending Message...' : 'Send Message'}
            </Button>
          </form>

          {status === 'sent' && (
            <div className="contact-success" role="status">
              <span className="contact-success-icon"><CircleCheck size={32} aria-hidden="true" /></span>
              <h3>Message Sent Successfully!</h3>
              <p>Thank you for contacting HavitGrowth. Our global support nodes have logged your query and will reply via email.</p>
              <Button variant="secondary" onClick={resetForm}>Send Another Message</Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
