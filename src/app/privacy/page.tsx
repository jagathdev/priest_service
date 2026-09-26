"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";

type TabId = "privacy" | "cookies";

export default function PrivacyPage() {
  const [activeTab, setActiveTab] = useState<TabId>("privacy");

  // Allow URL hash navigation if someone links directly to a section
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace("#", "") as TabId;
      const validTabs: TabId[] = ["privacy", "cookies"];
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
    { id: "privacy", label: "Privacy Policy", icon: "fa-solid fa-shield-halved" },
    { id: "cookies", label: "Cookies Policy", icon: "fa-solid fa-cookie-bite" },
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
              alt="Privacy Policy Banner"
              className="w-full h-auto rounded-xl object-cover max-h-[300px]"
            />
          </div>
        </section>

        {/* Content Section */}
        <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-1.5 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
                <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                  Privacy Sections
                </p>
                <nav className="flex flex-col gap-1" aria-label="Sidebar Navigation">
                  {tabs.map((tab) => {
                    const isSelected = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex items-center gap-3 w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 ${
                          isSelected
                            ? "bg-[#6869F9]/10 text-[#5B5BF6] shadow-xs"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <i
                          className={`${tab.icon} text-base transition-colors ${
                            isSelected ? "text-[#5B5BF6]" : "text-gray-400 group-hover:text-gray-600"
                          }`}
                        ></i>
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
                {/* 1. Privacy Policy Section */}
                {activeTab === "privacy" && (
                  <div className="space-y-8 animate-fadeIn">
                    <div>
                      <h2 className="text-2xl font-black text-[#16111f] md:text-3xl border-b border-gray-100 pb-4 flex justify-between items-center">
                        Privacy Policy
                        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">
                          Ver 2.1 | 16 Oct 2019
                        </span>
                      </h2>
                      <p className="mt-6 text-base leading-relaxed text-gray-700">
                        At AstroVed, we take online privacy and security concerns seriously. At the same time, we are continuously working to make your AstroVed experience an entertaining, pleasant, and satisfying one. To accomplish these goals, we need to obtain some information from you when you use our site. This privacy policy will tell you how and when we collect information through our website and how this information will be used.
                      </p>
                      <p className="mt-4 text-base leading-relaxed text-gray-700">
                        All personal credit information entered is protected through the use of Secure Server technology. This ensures that personal information such as credit card information cannot be read, intercepted, or hacked as the information travels over the Internet. Therefore, we feel you can have complete confidence in the security of your transactions while shopping with AstroVed.
                      </p>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-5">
                      <h3 className="text-lg font-bold text-[#2b2d70] mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-book-open"></i> GLOSSARY
                      </h3>
                      <div className="space-y-3 text-sm text-gray-700">
                        <p>
                          <strong className="text-gray-900">Data controller (organization)</strong> means “the natural or legal person, public authority, agency or another body which, alone or jointly with others, determines the purposes and means of the processing of personal data.”
                        </p>
                        <p>
                          <strong className="text-gray-900">Data subject (individual)</strong> means an identifiable natural person “who can be identified, directly or indirectly, in particular by reference to an identifier such as a name, an identification number, location data, or an online identifier.”
                        </p>
                        <p>
                          <strong className="text-gray-900">Personal data</strong> means “any information relating to an identified or identifiable natural person (‘data subject’).” The Regulation states this also includes online identifiers such as IP addresses and cookies.
                        </p>
                        <p>
                          <strong className="text-gray-900">Data processor (service providers)</strong> “a person, public authority, agency or another body which processes personal data on behalf of the controller.” An example is a Cloud provider that offers data storage.
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-[#16111f] mb-4">Core Principles of Data Processing</h3>
                      <p className="text-base text-gray-700 mb-4">
                        AstroVed complies with all six general principles when processing personal data. The personal data shall be:
                      </p>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          "Processed lawfully, fairly, and transparently",
                          "Collected only for specific legitimate purposes",
                          "Adequate, relevant, and limited to what is necessary",
                          "Stored only as long as is necessary",
                          "Must be accurate and kept up to date",
                          "Ensure appropriate security, integrity, and confidentiality",
                        ].map((principle, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm text-gray-700 border border-gray-100 rounded-xl p-3 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#6869F9]/10 text-[#5B5BF6] text-xs font-bold mt-0.5">
                              {index + 1}
                            </span>
                            <span className="leading-relaxed">{principle}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-l-4 border-amber-500 bg-amber-50/30 p-5 rounded-r-xl">
                      <h3 className="text-lg font-bold text-amber-900 mb-2 flex items-center gap-2">
                        <i className="fa-solid fa-child"></i> Additional Protection for Children
                      </h3>
                      <p className="text-sm leading-relaxed text-amber-800 font-medium">
                        Consent from a child concerning online services is only valid if authorized by a parent. A child is someone below the age of 16; Within the Data Protection Bill, the UK Government is reducing the age to 13.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-[#16111f] pb-2 border-b border-gray-100">Part I. Information Collection and Security</h3>
                      
                      <p className="text-base text-gray-700 leading-relaxed">
                        AstroVed.com collects information for internal use within the AstroVed business only. We will not sell, rent, or disclose any information related to you to any company outside AstroVed for such company’s own marketing or other commercial use, without obtaining your permission.
                      </p>

                      <div>
                        <p className="text-base font-semibold text-gray-800 mb-3">We collect personal information from you through our web site only when you:</p>
                        <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
                          <li>Register a New Account</li>
                          <li>Add sub-users to your membership account</li>
                          <li>Purchase a service, product, program or solution</li>
                          <li>Sign up for our newsletter</li>
                          <li>Access our online content (Text, audio, and Video)</li>
                          <li>Request information or send an email using our online Contact Form.</li>
                        </ul>
                      </div>

                      <div>
                        <p className="text-base font-semibold text-gray-800 mb-3">Astroved collects personal information on our web site submitted by registered Members (users) with consent. Such information may include:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-medium text-gray-700 bg-slate-50 border border-gray-100 p-5 rounded-xl">
                          {[
                            "First Name", "Last Name", "Gender",
                            "Birth Details (Date, Time, Place, City, Country)", 
                            "Current Location (City and Country)", 
                            "Credit / Debit card Information (in encryption Mode)",
                            "Billing Address", "Shipping Address", "Phone Number and Skype ID",
                            "Email Address", "Purchase Information (Products, amount, date)"
                          ].map((item) => (
                            <div key={item} className="flex items-start gap-2">
                              <i className="fa-solid fa-circle-check text-[#10b981] mt-0.5 text-[10px]"></i>
                              <span className="leading-snug">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <p className="text-base text-gray-700 leading-relaxed">
                        Other information may include; user-submitted news and events, uploaded photos, profiles, private messages, and blog posts. The information is collected by the voluntary submittal of such by registered Members (users).
                      </p>

                      <p className="text-base text-gray-700 leading-relaxed">
                        Your user id and password will ensure that you are the only one who can access the account. However, it remains your responsibility to ensure no unauthorized access to your account. It is also your responsibility to ensure that no minor can access your account.
                      </p>
                      
                      <p className="text-base text-gray-700 leading-relaxed">
                        We will use your email address to fulfill your requests for items such as general information, reports, and newsletters. We will use your gender, birth, and current location information to provide you with the astrological reports and services you request. We require credit card information to complete your order through globally accepted Payment gateways.
                      </p>

                      <div className="border border-indigo-100 bg-indigo-50/30 p-6 rounded-2xl">
                        <h4 className="text-lg font-bold text-[#2b2d70] mb-3 flex items-center gap-2">
                          <i className="fa-solid fa-users"></i> Adding Users Under Your Membership
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          For our members, AstroVed allows you to run reports on additional users you are interested in viewing astrological data for. AstroVed will let you run reports on all your additional users. In order to do this, we need to collect their 1) name, 2) birth/gender information, 3) and current location information. All of this information will be used for reporting and service delivery purposes only.
                        </p>
                      </div>

                      <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl">
                        <p className="text-base leading-relaxed text-gray-700 mb-3">
                          AstroVed websites employ the use of “cookies.” A cookie is a small text file that our web server places on a user’s computer hard drive to be a unique identifier. Cookies enable Astroved to track usage patterns and deliver customized content and offer Services, Products, and Solutions to our Members (users).
                        </p>
                        <p className="text-base font-bold text-[#2b2d70] mb-3 bg-white px-4 py-2 rounded-lg border border-gray-200 inline-block">
                          Our cookies do not collect personally identifiable information.
                        </p>
                        <p className="text-base leading-relaxed text-gray-700">
                          Astroved does not divulge any personally identifiable information about registered Members (users) or Astroved members to outside parties for any reason (with the exception of a request made for such information [which is legally warranted and presented in person] by an official law enforcement official or agency).
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-6">
                      <h3 className="text-2xl font-bold text-[#16111f] pb-2 border-b border-gray-100">Part II. Information Usage</h3>
                      <p className="text-base leading-relaxed text-gray-700">
                        The information collected by AstroVed is used for our websites only. Registered Members (users) may receive additional announcements from us about site news, events, Service, Product and Program Offerings, private messages, uploaded photos, blog posts, and website updates. Out of respect for the privacy of our registered Members (users), we present the option not to receive these types of communications.
                      </p>
                      <p className="text-base leading-relaxed text-gray-700">
                        We do offer links to other websites. Please note: When you click on links to other websites, we encourage you to read their privacy policies. Their standards may differ from ours.
                      </p>
                      <p className="text-base leading-relaxed text-gray-700">
                        Because our websites also offer user-submitted posts and comments, please be advised that information posted in these venues becomes public knowledge with the submittal of any information or images contained therein.
                      </p>
                      <p className="text-base leading-relaxed text-gray-700">
                        We reserve the right to update our website privacy policy without notice. We reserve the right to remove user-submitted information or images without user consent or notice meeting any legal purposes. We also reserve the right to add or remove site features without notice.
                      </p>
                    </div>

                    <div className="space-y-4 pt-6">
                      <h3 className="text-2xl font-bold text-[#16111f] pb-2 border-b border-gray-100">Part III. Access to Information</h3>
                      <p className="text-base leading-relaxed text-gray-700">
                        At AstroVed, we are committed to creating high-quality services, and we are interested in building long-lasting relationships with our customers. Relationships are built on trust, so if you ever question what data has been collected or you may want to change the personal information you may do so by accessing your online account anytime if you have registered with us.
                      </p>
                      <p className="text-base leading-relaxed text-gray-700">
                        We empower individuals (our Members) and give them control over their personal data. These include the ability to access their own personal data, require rectification of inaccurate data, object to direct marketing, and challenge automated decisions about them; it also confers significant additional new rights for individuals.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="p-6 rounded-2xl border border-red-100 bg-red-50/30 hover:shadow-md transition-shadow">
                          <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2 text-lg">
                            <i className="fa-solid fa-eraser text-red-500"></i> Right to be Forgotten
                          </h4>
                          <p className="text-sm text-red-800/80 leading-relaxed">
                            Individuals have a new right to require the data controller to erase all personal data held about them in certain circumstances, such as where the data is no longer necessary for the purposes for which it was collected. There are a number of exemptions to this right, for example, concerning freedom of expression and compliance with legal obligations.
                          </p>
                        </div>
                        <div className="p-6 rounded-2xl border border-indigo-100 bg-indigo-50/30 hover:shadow-md transition-shadow">
                          <h4 className="font-bold text-[#2b2d70] mb-3 flex items-center gap-2 text-lg">
                            <i className="fa-solid fa-file-export text-[#5B5BF6]"></i> Right to Data Portability
                          </h4>
                          <p className="text-sm text-indigo-900/80 leading-relaxed">
                            This is a new concept under the GDPR and allows Individuals to obtain and reuse their personal data for their own purposes across different services. The personal data must be made available in a structured, commonly used, and machine-readable format.
                          </p>
                        </div>
                      </div>

                      <div className="mt-8 bg-slate-50 border border-gray-200 p-6 rounded-2xl">
                        <p className="text-base leading-relaxed text-gray-700">
                          Registered users who wish to delete their information from our database are always welcome to notify us by email to <a href="mailto:privacy@astroved.com" className="text-[#5B5BF6] font-bold hover:underline transition-colors">privacy@astroved.com</a> at our dedicated Privacy help center from the Astroved website, where our team will be more than happy to assist you.
                        </p>
                        <p className="mt-4 text-sm text-gray-500 italic leading-relaxed">
                          *If at any point you do not wish to receive further emails from us, you can just unsubscribe using the link at the bottom of every email.
                        </p>
                        <p className="mt-4 text-base font-semibold text-gray-800 border-l-4 border-[#6869F9] pl-3">
                          We apply the principles of data protection by design and by default.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-6">
                      <h3 className="text-2xl font-bold text-[#16111f] pb-2 border-b border-gray-100">Part IV. Problem Resolution</h3>
                      <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-6 mb-6">
                        <h4 className="font-bold text-orange-900 mb-3 flex items-center gap-2 text-lg">
                          <i className="fa-solid fa-triangle-exclamation text-orange-500"></i> Data Breach Notification
                        </h4>
                        <p className="text-sm text-orange-800 leading-relaxed">
                          Appropriate protective measures – essentially encryption – are in place to eliminate danger to data subjects. It is mandatory for us to report any data breach to our supervisory authority and Data Subjects within 72 hours of becoming aware of it.
                        </p>
                      </div>
                      <div className="flex items-center gap-3 bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                        <i className="fa-solid fa-envelope-open-text text-blue-500 text-xl"></i>
                        <p className="text-base text-gray-700">
                          If problems arise from your use of this website, please feel free to email Astroved at: <a href="mailto:privacy@astroved.com" className="text-[#5B5BF6] font-bold hover:underline">privacy@astroved.com</a>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Cookies Policy Section */}
                {activeTab === "cookies" && (
                  <div className="space-y-8 animate-fadeIn">
                    <div>
                      <h2 className="text-2xl font-black text-[#16111f] md:text-3xl border-b border-gray-100 pb-4 flex items-center gap-3">
                        <i className="fa-solid fa-cookie text-[#5B5BF6]"></i> Cookies Policy
                      </h2>
                      
                      <div className="mt-8 space-y-6">
                        <div className="bg-slate-50 border border-gray-100 rounded-2xl p-6">
                          <h3 className="text-xl font-bold text-[#2b2d70] mb-4">
                            What is Cookie, and why do we use Cookies?
                          </h3>
                          <div className="space-y-4 text-gray-700 leading-relaxed">
                            <p>
                              On our website, we are using ‘cookies’ to collect information about the users visiting the website. Cookies are small information files saved in your browser when you visit a site. These cookies help us to give better user experience throughout the website.
                            </p>
                            <p>
                              Cookies are used by our website to provide you with a more personal and customized experience on our website. The information that is collected via cookies is used to make the website experience more personal and relevant to your needs.
                            </p>
                            <p>
                              The primary main use of cookies is to give you a customized experience of the website and for the smooth user flow when using our website.
                            </p>
                            <p className="font-medium bg-white p-4 rounded-xl border border-gray-100">
                              When a user browses our website, we are likely to store some of the information in the form of cookies on your computers. Our website uses cookies created with this purpose to deliver our services and to show you relevant services and products. It gives you an improved and personalized usage of the content and provides you the content that is relevant to your interest in all your future visits to our website.
                            </p>
                          </div>
                        </div>

                        <div className="border border-blue-200 bg-blue-50/40 p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center gap-6 justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">How to manage your Cookies?</h3>
                            <p className="text-sm text-gray-600 max-w-xl">
                              You have full control over your privacy. To learn more about managing or disabling cookies in your specific browser, check out our comprehensive guide.
                            </p>
                          </div>
                          <a
                            href="https://bit.ly/2i0QbSd"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 inline-flex items-center gap-2 bg-[#5B5BF6] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#4a4ae2] transition-colors shadow-md shadow-blue-500/20"
                          >
                            <span>Manage Settings</span>
                            <i className="fa-solid fa-arrow-up-right-from-square text-sm"></i>
                          </a>
                        </div>
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
