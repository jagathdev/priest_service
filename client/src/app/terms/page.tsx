"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";

type TabId = "refunds" | "security" | "shipment" | "disclaimer";

export default function TermsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("refunds");

  // Allow URL hash navigation if someone links directly to a section
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace("#", "") as TabId;
      const validTabs: TabId[] = ["refunds", "security", "shipment", "disclaimer"];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      }
    }
  }, []);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `#${tab}`);
    }
  };

  const tabs = [
    { id: "refunds", label: "Refunds & Cancellations", icon: "fa-solid fa-rotate-left" },
    { id: "security", label: "Security Policy", icon: "fa-solid fa-lock" },
    { id: "shipment", label: "Shipment Policy", icon: "fa-solid fa-truck-fast" },
    { id: "disclaimer", label: "Disclaimer & Copyright", icon: "fa-solid fa-scale-balanced" },
  ] as const;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50/50 pb-20 text-[#241a46]">
        {/* Header Section with Image & Title */}
        <section className="mx-auto max-w-7xl px-6 pt-12 text-center lg:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-xs">
            <img
              src="https://www.astroved.com/wp-content/uploads/2023/06/terms-and-conditions.jpg"
              alt="Terms and Conditions Banner"
              className="w-full h-auto rounded-xl object-cover"
            />
          </div>
          {/* <h1 className="mt-8 text-3xl font-black tracking-wide text-[#16111f] md:text-4xl uppercase">
            TERMS AND CONDITION
          </h1> */}
        </section>

        {/* Content Section */}
        <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-1.5 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
                <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                  Document Sections
                </p>
                <nav className="flex flex-col gap-1" aria-label="Sidebar Navigation">
                  {tabs.map((tab) => {
                    const isSelected = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex items-center gap-3 w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 ${isSelected
                          ? "bg-[#6869F9]/10 text-[#5B5BF6] shadow-xs"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                      >
                        <i className={`${tab.icon} text-base transition-colors ${isSelected ? "text-[#5B5BF6]" : "text-gray-400 group-hover:text-gray-600"}`}></i>
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Content Display Area */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-10">
                {/* 3. Refunds & Cancellations Section */}
                {activeTab === "refunds" && (
                  <div className="space-y-8 animate-fadeIn">
                    <div>
                      <h2 className="text-2xl font-black text-[#16111f] md:text-3xl border-b border-gray-100 pb-4">
                        Refund &amp; Cancellation Policy
                      </h2>

                      <h3 className="text-xl font-bold text-[#16111f] mt-8 mb-4">Order Cancellation</h3>
                      <h4 className="text-base font-extrabold text-[#2b2d70] mb-2">How do I cancel an order?</h4>
                      <p className="text-base leading-relaxed text-gray-700 mb-4">
                        AstroVed believes in complete customer satisfaction and transparency in order cancellation process. To satisfy our customers&rsquo; needs, we have a very liberal &ldquo;Return Policy&rdquo; on purchases made from our website. In an unlikely event of the customer expressing dissatisfaction with the authenticity or quality of the products purchased from us, we will initiate the refund of the value of the product. However, please note that:
                      </p>

                      <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700 mb-6 bg-slate-50 p-5 rounded-2xl border border-gray-100">
                        <li>The purchased product should be returned to us within a week of delivery at customer&rsquo;s own expense.</li>
                        <li>Any FREE GIFTS provided along with the original purchase of the product will also have to be returned.</li>
                        <li>AstroVed will not reimburse the shipping charges.</li>
                        <li>Refunds are always issued to the original payment method or account of payment from which AstroVed received payment for the product being refunded.</li>
                      </ul>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50/20 p-5">
                      <h4 className="font-bold text-amber-950 mb-2 flex items-center gap-2">
                        <i className="fa-solid fa-circle-exclamation text-amber-600"></i> Online Cancellation Details
                      </h4>
                      <p className="text-sm text-amber-900 leading-relaxed">
                        The customer cannot initiate online cancellation from their order log and is recommended to contact the CRM team for taking in any cancellation request or for any cancellation related questions/clarifications.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-base">How long will it take to process my cancellation request?</h4>
                        <p className="text-sm text-gray-600 leading-relaxed mt-1">
                          If the customer requests for cancellation of item(s), please allow for a minimum of 1-2 business days to process the request and 3-4 days to initiate the refund. An email will be sent notifying the customer of the status thereon, and the refund will be processed soon after we receive back the canceled item(s) in good shape. However, if the customer opts for having the money transferred back to the bank account, the process would entail a period of 7-10 business days for the refund to be realized, after receiving the returned item(s).
                        </p>
                      </div>

                      <div>
                        <h4 className="font-bold text-gray-900 text-base">Can I cancel a part of the order?</h4>
                        <p className="text-sm text-gray-600 leading-relaxed mt-1">
                          No. Customer cannot cancel a part of the order.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-bold text-gray-900 text-base">Whom should a customer contact to get the money transferred through bank account for the cancelled product?</h4>
                        <p className="text-sm text-gray-600 leading-relaxed mt-1">
                          Please send in an email to{" "}
                          <a href="mailto:support@astroved.com" className="text-[#5B5BF6] font-bold hover:underline">
                            support@astroved.com
                          </a>{" "}
                          detailing your bank account information: Beneficiary name, Account Number, Bank Branch, IFSC code, and your mobile number to facilitate speedy action.
                        </p>
                      </div>

                      <div className="p-5 border border-red-100 bg-red-50/20 rounded-2xl">
                        <h4 className="font-bold text-red-950 text-base flex items-center gap-2">
                          <i className="fa-solid fa-triangle-exclamation text-red-600"></i> How do I return an item purchased on AstroVed?
                        </h4>
                        <p className="text-sm text-red-900 leading-relaxed mt-2">
                          AstroVed has created a simple refund policy keeping our customer&rsquo;s best interests in mind. Please note that the customer, however, has to send the product back in its original condition without any damage, at his/her own cost through courier. AstroVed will under no circumstances be liable for a refund if the product is found tampered, damaged, or defective in any way when received by us.
                        </p>
                        <p className="text-sm font-extrabold text-red-950 mt-3">
                          *Products customized as per the customer&rsquo;s requirements will not be exchanged or refunded under any circumstances.
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-[#16111f] mb-4">Refund for Products</h3>

                      <div className="space-y-4">
                        <div className="p-5 rounded-2xl bg-slate-50 border border-gray-100">
                          <h4 className="font-bold text-gray-900">Cash on Delivery (COD) Refunds</h4>
                          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                            Please call us on our helpline number Toll-Free <span className="font-bold text-gray-900">1800 102 9098</span> (India Only) to speak to our customer support executive or email us at <a href="mailto:support@astroved.com" className="text-[#5B5BF6] hover:underline">support@astroved.com</a>. Once your request is registered from our end, and we have received the product back from you, we shall transfer the money to your bank account via NEFT.
                          </p>
                          <p className="text-xs font-semibold text-gray-500 mt-3 uppercase tracking-wider">Required Bank Details:</p>
                          <ul className="list-disc pl-5 text-xs text-gray-600 mt-1 space-y-1">
                            <li>Beneficiary name</li>
                            <li>Account Number</li>
                            <li>Bank Name</li>
                            <li>Bank Branch</li>
                            <li>IFSC code</li>
                            <li>Mobile number</li>
                          </ul>
                        </div>

                        <div className="p-5 rounded-2xl bg-slate-50 border border-gray-100">
                          <h4 className="font-bold text-gray-900">Debit Card Refunds</h4>
                          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                            You can call us on our helpline number to speak to our customer support executive or email us at <a href="mailto:support@astroved.com" className="text-[#5B5BF6] hover:underline">support@astroved.com</a> along with your bank account details as stated above. After receiving the product in its original state, we will refund the money in your bank account.
                          </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-slate-50 border border-gray-100">
                          <h4 className="font-bold text-gray-900">Credit Card Refunds</h4>
                          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                            You can call us on our helpline number to speak to our customer support executive or email us at <a href="mailto:support@astroved.com" className="text-[#5B5BF6] hover:underline">support@astroved.com</a>. Once your request is registered from our end and received the product back from you in its original condition, we shall credit the amount back to the same Credit Card which was used to purchase the product.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-[#16111f] mb-4">Refund Procedure for Homas/Poojas</h3>
                      <p className="text-base text-gray-700 leading-relaxed mb-4">
                        All homas (Fire labs) and Poojas performed by AstroVed on behalf of the customer is performed following the Vedic procedures strictly by priests who have initiations in performing the rituals. If any of our customer name/birth star has been missed out by mistake while performing Group Homas/Poojas, during the special event, that particular name can be accommodated in another Fire Lab/Pooja. Failing which, the customer can request for a refund of the amount if he/she so wishes.
                      </p>

                      <h4 className="font-bold text-gray-900 text-base">Rescheduling Individual Homa</h4>
                      <p className="text-sm text-gray-600 leading-relaxed mt-1">
                        Please note that in case of a rescheduling request for the individual Homa/Pooja, the customer has to inform the CRM team requesting the reschedule at least <span className="font-bold text-gray-900">48 hours before the scheduled time</span> for us to stop the preparations. This way, necessary arrangements can be made for rescheduling the homa/Pooja.
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed mt-2">
                        Further updates on the date and time of the rescheduled homa will be communicated through email to the customer.
                      </p>
                    </div>
                  </div>
                )}

                {/* 4. Security Policy Section */}
                {activeTab === "security" && (
                  <div className="space-y-8 animate-fadeIn">
                    <div>
                      <h2 className="text-2xl font-black text-[#16111f] md:text-3xl border-b border-gray-100 pb-4">
                        Security Policy
                      </h2>
                      <p className="mt-6 text-base leading-relaxed text-gray-700">
                        Protecting your information is one of AstroVed&rsquo;s highest priorities. When you sign up for a membership or make purchases at AstroVed, all personal credit information entered is protected through the use of Secure Server technology. This ensures that personal information such as credit card information cannot be read, intercepted, or hacked as the information travels over the Internet.
                      </p>
                      <p className="mt-4 text-base leading-relaxed text-gray-700">
                        Therefore, we feel you can have complete confidence in the security of your transactions while shopping with AstroVed.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                      <div className="p-5 border border-slate-100 bg-slate-50/50 rounded-2xl text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600 text-xl mb-4">
                          <i className="fa-solid fa-shield-halved"></i>
                        </div>
                        <h4 className="font-bold text-gray-900">Secure Server</h4>
                        <p className="text-xs text-gray-500 mt-2">All sessions and transactions are fully protected via industry-standard SSL encryption.</p>
                      </div>
                      <div className="p-5 border border-slate-100 bg-slate-50/50 rounded-2xl text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xl mb-4">
                          <i className="fa-solid fa-user-shield"></i>
                        </div>
                        <h4 className="font-bold text-gray-900">Privacy Guards</h4>
                        <p className="text-xs text-gray-500 mt-2">Strict internal access restrictions to guarantee no leakage of horoscopes or private details.</p>
                      </div>
                      <div className="p-5 border border-slate-100 bg-slate-50/50 rounded-2xl text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xl mb-4">
                          <i className="fa-solid fa-credit-card"></i>
                        </div>
                        <h4 className="font-bold text-gray-900">Encrypted Payments</h4>
                        <p className="text-xs text-gray-500 mt-2">Payment information is processed in encrypted mode through globally accepted gateways.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Shipment Policy Section */}
                {activeTab === "shipment" && (
                  <div className="space-y-8 animate-fadeIn">
                    <div>
                      <h2 className="text-2xl font-black text-[#16111f] md:text-3xl border-b border-gray-100 pb-4">
                        Shipment Policy
                      </h2>
                      <p className="mt-6 text-base leading-relaxed text-gray-700">
                        At AstroVed, we strive to promptly ship products and prasad and ensure the products ordered reach you on time. Below is the shipping policy of AstroVed, which depends on Indian government shipping policies.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-950 flex items-center gap-2">
                          <i className="fa-solid fa-truck-ramp-box text-[#5B5BF6]"></i> AstroVed&rsquo;s Mode of Shipping Products and Prasad
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed mt-2">
                          We offer our members domestic (within India) and international shipping options. We ensure the product or the prasad of the service reaches our members on time via standard or express shipping options for domestic and international shipping. However, the shipping methods may be unavailable for specific countries and products being shipped due to international shipping policy.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-950 flex items-center gap-2">
                          <i className="fa-solid fa-clock text-[#5B5BF6]"></i> AstroVed&rsquo;s Shipping Time
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          <div className="p-5 border border-slate-100 bg-slate-50/50 rounded-2xl">
                            <h4 className="font-bold text-gray-900 text-sm">Domestic Shipping (Within India)</h4>
                            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                              Dispatched from Chennai, Tamil Nadu, after 7 working days from the order date (including the energization process). Estimated delivery is <span className="font-semibold text-gray-900">7 working days</span> from dispatch.
                            </p>
                          </div>
                          <div className="p-5 border border-slate-100 bg-slate-50/50 rounded-2xl">
                            <h4 className="font-bold text-gray-900 text-sm">International Shipping</h4>
                            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                              Starts 7 working days from the order date including product energization. Estimated delivery is <span className="font-semibold text-gray-900">3 to 4 weeks</span>, based on destination and customs.
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                          *For Special services, domestic shipment of Prasad/Product starts 7 working days after the entire set of rituals in the package has been completed. Processing time may be slightly longer depending on receiving the Prasad from sacred Powerspots.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-950 flex items-center gap-2">
                          <i className="fa-solid fa-hand-holding-dollar text-[#5B5BF6]"></i> Shipping Costs
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed mt-2">
                          AstroVed calculates its shipping cost based on the product size (dimension), product weight, and destination. The product shipping charges will be displayed at checkout before you place the order.
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed mt-2 font-semibold text-gray-800">
                          When the product is part of a package and our member is entitled to receive the Prasad for the services included in the package or for eligible Homas, we offer free shipping, which will be mentioned on our website.
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          *We are not responsible for any delays or additional fees/duties/taxes incurred during the customs clearance process for international orders.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-950 flex items-center gap-2">
                          <i className="fa-solid fa-map-location-dot text-[#5B5BF6]"></i> Order Tracking
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed mt-2">
                          You can log in to your AstroVed account and go to &ldquo;My Orders.&rdquo; Once your order is shipped, a tracking number can be seen against your order. Once you get your tracking number, please visit the official website of India Post to track your shipment.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-950 flex items-center gap-2">
                          <i className="fa-solid fa-circle-question text-[#5B5BF6]"></i> Lost or Damaged Shipments
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed mt-2">
                          Please contact our Customer Support team via email (<a href="mailto:support@astroved.com" className="text-[#5B5BF6] font-bold hover:underline">support@astroved.com</a>) in case your product package arrives damaged within 2 working days from receipt, or is lost. We will investigate and work with the carrier. We may require photos/opening video or a damage report to process claims.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-950 flex items-center gap-2">
                          <i className="fa-solid fa-headset text-[#5B5BF6]"></i> Customer Support Contact
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed mt-2">
                          Email us at <a href="mailto:support@astroved.com" className="text-[#5B5BF6] font-bold hover:underline">support@astroved.com</a> or call our Helpline Toll-Free number <span className="font-bold text-gray-900">1800 102 9098</span> (India Only) to speak to our customer support executive. Available Monday to Saturday from 9:30 am to 6:30 pm IST.
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                      <p className="text-sm text-gray-500">
                        For more details, please review our official{" "}
                        <a
                          href="https://www.astroved.com/corporate-info/return-refund-policy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#5B5BF6] font-bold hover:underline"
                        >
                          Return &amp; Refund Policy Link
                        </a>.
                      </p>
                    </div>
                  </div>
                )}

                {/* 6. Disclaimer & Copyright Section */}
                {activeTab === "disclaimer" && (
                  <div className="space-y-8 animate-fadeIn">
                    <div>
                      <h2 className="text-2xl font-black text-[#16111f] md:text-3xl border-b border-gray-100 pb-4">
                        Disclaimers &amp; Copyright Notice
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <i className="fa-solid fa-eye-slash text-gray-500"></i> Confidentiality Disclaimer
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed mt-2">
                          AstroVed guarantees complete confidentiality in regards to the details of members&rsquo; horoscopes and identities. AstroVed will only use the information revealed in a member&rsquo;s horoscope to communicate predictive results directly to that member.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <i className="fa-solid fa-envelope-open-text text-gray-500"></i> Email Disclaimer
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed mt-2">
                          AstroVed does not sell or transfer email information to any entity or persons. Upon becoming a member of AstroVed, AstroVed will send you one newsletter announcement containing Vedic Astrology insights and AstroVed specials. You may unsubscribe at any time (usually processed within 48 hours).
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <i className="fa-solid fa-circle-exclamation text-amber-600"></i> Product Liability Disclaimer
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed mt-2">
                          While AstroVed uses reasonable efforts to include accurate and up to date information, AstroVed makes no guarantees or representations regarding the accuracy or significance of any aspect of the astrological horoscope and predictive advice imparted. AstroVed cannot be held responsible for any interpretation, action, or use that may be made as a result of the information given.
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed mt-2">
                          In no event shall AstroVed, its employees, agents, suppliers, or contractors be liable for damages of any kind, including without limitation any compensatory, incidental, direct, indirect, special, punitive or consequential damages, loss of use, loss of data, loss of income or profit, damage to property, claims of third parties, or any other kind of losses arising out of or in connection to the AstroVed website.
                        </p>
                        <div className="bg-amber-50/40 border-l-4 border-amber-500 p-4 rounded-r-xl mt-3 text-xs leading-relaxed text-amber-900">
                          The horoscope and predictive advice received by members should not be used as a substitution for the advice, programs, or treatment that would typically be obtained from a licensed professional, such as a lawyer, doctor, psychiatrist, or a financial adviser. AstroVed will not be held responsible for any claims regarding negative results following the undertaking of astrological remedies (gemstones, mantras, temple rituals, Homas) by members.
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed mt-3">
                          AstroVed does not carry on or purport to carry on the treatment of any specific disease, disorder, or ailment, nor does AstroVed promise to medically alleviate any particular physical condition. By using this website, you acknowledge that you are not using the services of AstroVed for the cure or redressal of any specific disease, disorder, ailment, or physical condition.
                        </p>
                      </div>

                      <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <i className="fa-regular fa-copyright text-gray-500"></i> Copyright Disclaimer
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed mt-2">
                          All images, text, graphics, audios, videos, streaming videos are the property of AstroVed, including the look and feel of the AstroVed.com website. All of these are under copyright. None of the above may be resold, redistributed, or republished without prior written permission from AstroVed.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <i className="fa-regular fa-image text-gray-500"></i> Images
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed mt-2">
                          All celebrity photo images on this site are believed to be public domain, gathered from all over the internet, and there is no copyright on these pictures as far as we are concerned. If there is a picture on this site that has copyright, then the owner can email us at{" "}
                          <a href="mailto:info@astroved.com" className="text-[#5B5BF6] font-bold hover:underline">
                            info@astroved.com
                          </a>{" "}
                          and we will remove the image. None of the persons on this site have authorized their presence here. This site is not associated with them or their companies in any way. All trademarks belong to their respective owners.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
