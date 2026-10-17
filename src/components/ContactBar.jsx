/*
  ContactBar component

  This component contains the contact information and
  copyright section shown at the bottom of the website.

  It is kept as a separate component because the same
  contact section is reused on multiple pages.
*/

import "./ContactBar.css"

function ContactBar() {

  return (
    <footer className="contact-bar">

      {/* Main contact information */}
      <div className="contact-content">

        <div className="contact-heading">
          <p className="eyebrow">X-MEN SHOP</p>
          <h2>NEED HELP?</h2>
        </div>


        <div className="contact-info">
          <p>Phone: +60 12-3456 789</p>
          <p>Email: contact@xmenshop.com</p>
        </div>

      </div>


      {/* Copyright information */}
      <div className="contact-bottom">
        <span>© 2026 X-Men Shop</span>
      </div>

    </footer>
  )
}


export default ContactBar
