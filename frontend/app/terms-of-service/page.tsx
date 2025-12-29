import { Header } from "@/components/header"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsOfServicePage() {
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

          <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: December 2024</p>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using the services provided by Peak Kinetics Physical Therapy ("we," "our," or "us"),
                you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use
                our services or website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Services Provided</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Peak Kinetics Physical Therapy provides professional physical therapy services, including but not
                limited to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>Sports rehabilitation and injury recovery</li>
                <li>Orthopedic physical therapy</li>
                <li>Pain management and chronic pain treatment</li>
                <li>Movement screening and functional assessments</li>
                <li>Geriatric care and fall prevention</li>
                <li>Wellness programs and preventive care</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                All services are provided by licensed physical therapists in accordance with applicable state and
                federal regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Patient Responsibilities</h2>
              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Appointment Scheduling</h3>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>You are responsible for scheduling, confirming, and attending your appointments</li>
                <li>We require at least 24 hours notice for appointment cancellations or rescheduling</li>
                <li>Late cancellations or no-shows may result in a fee or impact future scheduling</li>
                <li>Repeated no-shows may result in discharge from our services</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Medical Information</h3>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>You must provide accurate and complete medical history and health information</li>
                <li>You must inform us of any changes to your health status, medications, or insurance</li>
                <li>You are responsible for following prescribed treatment plans and home exercise programs</li>
                <li>You must notify us immediately if you experience adverse effects from treatment</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Insurance and Payment</h3>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>You are responsible for understanding your insurance coverage and benefits</li>
                <li>Co-payments and deductibles are due at the time of service</li>
                <li>You are ultimately responsible for all charges, regardless of insurance coverage</li>
                <li>We will bill your insurance company as a courtesy, but coverage is not guaranteed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Communication and Consent</h2>
              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Electronic Communications</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                By using our services, you consent to receive communications from us via:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>
                  <strong>Email:</strong> For appointment reminders, treatment updates, administrative notices, and
                  educational content
                </li>
                <li>
                  <strong>Text Messages (SMS):</strong> For appointment reminders, scheduling changes, and
                  time-sensitive notifications
                </li>
                <li>
                  <strong>Phone Calls:</strong> For appointment confirmations, care coordination, and administrative
                  matters
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Standard message and data rates may apply to SMS communications. You may opt out of non-essential
                communications, but you cannot opt out of critical appointment and care-related messages.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Review Requests</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may request feedback and reviews from you after receiving our services. Providing a review is
                voluntary, and you are under no obligation to do so. If you choose to submit a review, you grant us
                permission to use your feedback for marketing purposes while protecting your privacy in accordance with
                our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                While we strive to provide the highest quality care, physical therapy outcomes can vary based on
                individual circumstances. By using our services, you acknowledge that:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>Physical therapy results cannot be guaranteed</li>
                <li>You assume responsibility for following prescribed treatment plans</li>
                <li>We are not liable for outcomes resulting from non-compliance with treatment recommendations</li>
                <li>
                  Our liability is limited to the maximum extent permitted by law for any claims arising from our
                  services
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Website Use</h2>
              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Acceptable Use</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">You agree not to:</p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>Use our website for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to our systems or data</li>
                <li>Interfere with the proper functioning of our website</li>
                <li>Upload malicious code or viruses</li>
                <li>Collect or harvest information about other users</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Intellectual Property</h3>
              <p className="text-muted-foreground leading-relaxed">
                All content on our website, including text, images, logos, and materials, is the property of Peak
                Kinetics Physical Therapy and is protected by copyright and trademark laws. You may not reproduce,
                distribute, or create derivative works without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Termination of Services</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We reserve the right to terminate or refuse services to any patient for the following reasons:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>Non-compliance with treatment recommendations</li>
                <li>Failure to pay for services</li>
                <li>Abusive, threatening, or inappropriate behavior toward staff</li>
                <li>Repeated appointment no-shows or late cancellations</li>
                <li>Providing false or misleading information</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                In the event of termination, we will provide you with appropriate referrals and transfer of medical
                records as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Dispute Resolution</h2>
              <p className="text-muted-foreground leading-relaxed">
                Any disputes arising from these Terms of Service or our services will be resolved through binding
                arbitration in accordance with the rules of the American Arbitration Association, except where
                prohibited by law. The arbitration will take place in Texas, and both parties agree to waive their right
                to a jury trial.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms of Service are governed by the laws of the State of Texas, without regard to its conflict of
                law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. We will notify you of material
                changes by posting the updated terms on our website with a new "Last updated" date. Your continued use
                of our services after such changes constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have questions about these Terms of Service, please contact us:
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
