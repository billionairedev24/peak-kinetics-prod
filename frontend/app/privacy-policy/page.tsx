import { Header } from "@/components/header"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: December 2024</p>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Peak Kinetics Physical Therapy ("we," "our," or "us") is committed to protecting your privacy and
                ensuring the security of your personal health information. This Privacy Policy explains how we collect,
                use, disclose, and safeguard your information when you visit our website or use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">HIPAA Compliance</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                As a healthcare provider, we are required to comply with the Health Insurance Portability and
                Accountability Act (HIPAA) and maintain the privacy and security of your protected health information
                (PHI). We have implemented appropriate administrative, physical, and technical safeguards to protect
                your health information.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Your PHI will only be used and disclosed as permitted by HIPAA regulations and in accordance with our
                Notice of Privacy Practices, which is provided to you at your first visit.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Personal Information</h3>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>Name, date of birth, and contact information (email address, phone number, mailing address)</li>
                <li>Insurance information and billing details</li>
                <li>Medical history, treatment records, and health information</li>
                <li>Appointment scheduling and attendance records</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Automatic Information</h3>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>IP address, browser type, and device information</li>
                <li>Website usage data and analytics</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use your information for the following purposes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>To provide, maintain, and improve our physical therapy services</li>
                <li>To schedule appointments and manage your treatment plan</li>
                <li>To communicate with you about your care, appointments, and our services</li>
                <li>To process insurance claims and billing</li>
                <li>To comply with legal obligations and regulatory requirements</li>
                <li>To send appointment reminders, follow-up care instructions, and health-related information</li>
                <li>To improve our website and services based on your feedback</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Communication Preferences and Consent</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                By providing your contact information and using our services, you consent to receive communications from
                us via:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>
                  <strong>Email:</strong> Appointment confirmations, reminders, follow-up care instructions,
                  newsletters, and service updates
                </li>
                <li>
                  <strong>Text Messages (SMS):</strong> Appointment reminders, schedule changes, and time-sensitive
                  notifications
                </li>
                <li>
                  <strong>Phone Calls:</strong> Appointment confirmations, care coordination, and administrative matters
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You may opt out of non-essential communications at any time by contacting us at info@peakkineticspt.com
                or by following the unsubscribe instructions in our emails. Please note that you cannot opt out of
                essential communications related to your scheduled appointments and care.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Review and Feedback Collection</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may request your feedback and reviews about our services via email or text message after your
                treatment. Participation in providing reviews is entirely voluntary. If you choose to submit a review:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>Your review may be published on our website and third-party platforms</li>
                <li>We will only display your first name and last initial unless you provide additional consent</li>
                <li>You may request removal of your review at any time</li>
                <li>Reviews should not contain specific health information or treatment details</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Information Sharing and Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell or rent your personal information. We may share your information with:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>Healthcare providers involved in your care (with your consent)</li>
                <li>Insurance companies for claims processing and payment</li>
                <li>Legal authorities when required by law or to protect our rights</li>
                <li>
                  Service providers who assist us in operating our practice (under strict confidentiality agreements)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your personal and health information,
                including encryption, secure servers, access controls, and regular security assessments. However, no
                method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Under HIPAA and applicable laws, you have the right to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>Access and obtain copies of your health records</li>
                <li>Request corrections to your health information</li>
                <li>Request restrictions on how we use or disclose your information</li>
                <li>Request confidential communications</li>
                <li>Receive a list of disclosures we have made</li>
                <li>File a complaint if you believe your privacy rights have been violated</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services may be used by minors under the supervision of a parent or legal guardian. We collect
                information about minors only with parental consent and in accordance with HIPAA regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by
                posting the new policy on our website and updating the "Last updated" date. Your continued use of our
                services after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <div className="bg-muted p-6 rounded-lg">
                <p className="text-foreground font-medium mb-2">Peak Kinetics Physical Therapy</p>
                <p className="text-muted-foreground">1 Chisholm Trail, Suite 450</p>
                <p className="text-muted-foreground">Round Rock, TX 78681</p>
                <p className="text-muted-foreground mt-2">Phone: 737-368-2653</p>
                <p className="text-muted-foreground">Email: info@peakkineticspt.com</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
