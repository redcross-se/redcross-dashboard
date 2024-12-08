import React from "react";
import "./LandingPage.css";
import { Link } from "react-router-dom";

// Importing images
import RedCrossLogo from "../../assets/RedCrossLogo.png";
import HeroImage from "../../assets/redcross.jpg";
import CrisisImage from "../../assets/cq5dam.thumbnail.cropped.750.422.jpeg";
import ResponseImage from "../../assets/LRC_Report-Pic-3-1-e1727879299525.jpeg";
import VolunteerIcon from "../../assets/volunteer.svg";
import MoneyDonationIcon from "../../assets/Screenshot 2024-11-26 at 8.04.00 PM.png";
import BloodDonationIcon from "../../assets/donate-blood-bag-icon-in-red-and-black-color-vector.jpg";
import InstagramLogo from "../../assets/Instagram_logo_2022.svg.png";
import YouTubeLogo from "../../assets/rounded-square-red-and-white-youtube-logo-with-thick-white-border-and-long-shadow-on-a-transparent-background-free-png.webp";
import FacebookLogo from "../../assets/facebook-logo-2019.png";

function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">
          <img src={RedCrossLogo} alt="Red Cross Logo" />
          <span>Lebanese Red Cross - الدفاع المدني اللبناني</span>
        </div>
        <div className="nav-actions">
          <nav className="nav-links">
            <ul>
              <li>News & Updates</li>
              <li>Contact Us</li>
              <li>About Us</li>
              <li>Donate</li>
            </ul>
          </nav>
          <button className="donate-btn">
            <Link to="/login">Login</Link>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-text">
          <h1>Together We Save Lives</h1>
          <p>
            Your support helps us provide urgent relief to those in need across
            Lebanon.
          </p>
        </div>
        <img
          src={HeroImage}
          alt="Red Cross Volunteers"
          className="hero-image"
        />
      </section>

      {/* Crisis Updates */}
      <section className="crisis-updates">
        <h2>Current Crisis Updates</h2>
        <div className="crisis-content">
          <img src={CrisisImage} alt="Crisis Scene" className="crisis-image" />
          <div className="crisis-text">
            <p>
              Since September 17th, the conflict in Lebanon has intensified
              significantly, spreading death and destruction across the entire
              country. Over a million people have been displaced and are in
              urgent need of shelter, humanitarian aid, and medical services.
            </p>
            <p>
              As of October 7, 2023, the toll of the ongoing crisis has exceeded
              17,000 casualties, with at least 3,300 confirmed fatalities—a
              number that has surged dramatically since September 18th. This
              escalation is unfolding within an already precarious environment,
              marked by the ongoing conflict since October 8, 2023, a severe
              economic crisis, and Lebanon’s status as the country with the
              highest refugee population per capita worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Our Response */}
      <section className="response-section">
        <h2>Our Response</h2>
        <p>
          The Lebanese Red Cross (LRC) is tirelessly responding to escalating
          crises across Lebanon, providing critical health and disaster relief
          services.
        </p>
        <div className="response-list">
          <div className="response-item">
            <strong>Ambulance Response & Search and Rescue:</strong>
            <p>Active in all affected areas, including hospital evacuations.</p>
          </div>
          <div className="response-item">
            <strong>Blood Transfusion Services:</strong>
            <p>
              Supplying blood to hospitals nationwide for critically injured
              patients.
            </p>
          </div>
          <div className="response-item">
            <strong>Primary Healthcare:</strong>
            <p>
              Delivering medications and consultations, especially to displaced
              populations.
            </p>
          </div>
          <div className="response-item">
            <strong>Disaster Relief:</strong>
            <p>
              Providing blankets, food, shelter, hygiene kits, and water
              services.
            </p>
          </div>
        </div>
        <p>
          The LRC collaborates with municipalities, NGOs, and international
          partners to maximize aid while maintaining regular ambulance, blood,
          and healthcare services.
        </p>
        <div className="response-image">
          <img src={ResponseImage} alt="Relief Effort" />
        </div>
      </section>

      <section className="help-section">
        <h2>How You Can Help</h2>
        <div className="help-options">
          <div className="help-card">
            <img
              src={VolunteerIcon}
              alt="Volunteer Icon"
              className="help-icon"
            />
            <h3>Volunteer</h3>
            <p>
              Want to save lives and change minds? Join our Red Cross and Red
              Crescent family.
            </p>
            <button>Become a Volunteer</button>
          </div>
          <div className="help-card">
            <img
              src={MoneyDonationIcon}
              alt="Money Donation Icon"
              className="help-icon"
            />
            <h3>Money Donation</h3>
            <p>
              Want to save lives and bring hope? Join our Red Cross family by
              making a donation today.
            </p>
            <button>Donate Money</button>
          </div>
          <div className="help-card">
            <img
              src={BloodDonationIcon}
              alt="Blood Donation Icon"
              className="help-icon"
            />
            <h3>Blood Donation</h3>
            <p>
              Want to save lives and make a difference? Join our Red Cross
              family by donating blood today.
            </p>
            <button>Donate Blood</button>
          </div>
        </div>
      </section>
      <section className="education-section">
        <div className="education-content">
          <h2>Check out our educational courses</h2>
          <button className="discover-btn">Discover</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="contact-info">
            <h3>Contact Information:</h3>
            <p>LRC Hotline: 1760</p>
            <p>Headquarters: Spears Street, Kantari, Beirut</p>
            <p>For Emergencies: Call 140</p>
          </div>
          <div className="social-media">
            <h4>Follow Us</h4>
            <div className="social-icons">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={InstagramLogo} alt="Instagram" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={YouTubeLogo} alt="YouTube" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={FacebookLogo} alt="Facebook" />
              </a>
            </div>
          </div>
          <div className="app-download">
            <p>Download our new Application:</p>
            <button className="app-store-btn">App Store</button>
            <button className="google-play-btn">Google Play</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
