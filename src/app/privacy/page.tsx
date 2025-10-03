"use client";

import React from "react";
import { jsPDF } from "jspdf";

const privacyPolicyText = `
Trasora Privacy Policy
Effective Date: October 2, 2025

At Trasora, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our app.

1. Information We Collect
- Account Information: Full name, username, email address, and password when you create an account.
- Content You Share: Posts, comments, likes, and playlists you create.
- Usage Data: How you interact with the app, including features used, app crashes, and device type.
- Device Information: Device model, operating system, and IP address.

2. How We Use Your Information
- To provide, maintain, and improve Trasora.
- To personalize your experience and recommend music you may enjoy.
- To send important updates, security alerts, and support messages.
- To analyze app usage trends and improve our services.

3. Sharing Your Information
- We do not sell your personal data to third parties.
- We may share data with third-party service providers to help operate the app (e.g., hosting, analytics).
- We may disclose information if required by law or to protect Trasora’s rights.

4. Your Choices
- You can update your account information anytime in settings.
- You can delete your account to remove your personal data.
- You can opt out of marketing emails by following the unsubscribe instructions.

5. Security
We implement reasonable technical and organizational measures to protect your data from unauthorized access or disclosure.

6. Children’s Privacy
Trasora is not intended for children under 16. We do not knowingly collect personal data from children.

7. Changes to This Policy
We may update this policy from time to time. Changes will be posted in the app and take effect immediately upon posting.

8. Contact Us
If you have questions or concerns about this Privacy Policy, contact us at:
Email: trasoramusic@gmail.com
`;

export default function PrivacyPolicy() {
  const downloadPDF = () => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(privacyPolicyText, 180);
    doc.text(lines, 10, 10);
    doc.save("Trasora_Privacy_Policy.pdf");
  };

  return (
    <section className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md text-gray-900">
      <h1 className="text-3xl font-bold mb-4 text-center">Privacy Policy</h1>
      <div className="space-y-4 mb-6">
        {privacyPolicyText.split("\n\n").map((paragraph, idx) => (
          <p key={idx} className="text-gray-700">
            {paragraph}
          </p>
        ))}
      </div>
      <button
        onClick={downloadPDF}
        className="block mx-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-md transition"
      >
        Download PDF
      </button>
    </section>
  );
}
