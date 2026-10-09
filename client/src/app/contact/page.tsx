import Navbar from "@/components/layout/Navbar";

interface ContactItem {
  label: string;
  value: string;
  href: string;
  meta?: string;
}

interface ContactCard {
  icon: string;
  title: string;
  items: ContactItem[];
}

const contactCards: ContactCard[] = [
  {
    icon: "fa-regular fa-envelope",
    title: "Email Us",
    items: [
      {
        label: "Customer Support",
        value: "support@astroved.com",
        href: "mailto:support@astroved.com",
      },
      {
        label: "Business Queries",
        value: "business@astroved.com",
        href: "mailto:business@astroved.com",
      },
    ],
  },
  {
    icon: "fa-solid fa-phone",
    title: "Call Us",
    items: [
      {
        label: "India Support",
        value: "1800 102 9098",
        href: "tel:18001029098",
      },
      {
        label: "US Helpline",
        value: "+1 412-927 3625",
        href: "tel:+14129273625",
      },
    ],
  },
];

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white text-[#241a46]">
        <section className="mx-auto max-w-6xl px-6 py-14 lg:px-8">
          <div className="rounded-sm border border-gray-100 bg-white px-6 py-8 text-center shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
            <h1 className="mt-3 text-3xl font-black md:text-4xl">
              AstroVed Office Address
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-gray-700">
              AstroVed.Com Pvt. Ltd.,
              Prince Info Park, Plot No: 81-B,
              A-Block, 4th Floor, 2nd Main Road,
              Ambattur Industrial Estate,
              Chennai 600 058
            </p>
          </div>

          <div className="mt-9 grid gap-8 md:grid-cols-2">
            {contactCards.map((card) => (
              <div
                key={card.title}
                className="flex flex-col items-center justify-center rounded-sm bg-[#fff3eb] p-8 text-center shadow-[0_8px_22px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(244,120,32,0.18)]"
              >
                <i className={`${card.icon} text-3xl text-[#6869F9]`} aria-hidden="true"></i>
                <h2 className="mt-6 text-2xl font-black mb-6">{card.title}</h2>
                <div className="w-full flex flex-col gap-6">
                  {card.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        {item.label}
                      </span>
                      <a
                        href={item.href}
                        className="mt-1.5 text-lg font-bold text-[#6869F9] hover:underline"
                      >
                        {item.value}
                      </a>
                      {item.meta && (
                        <p className="mt-1 text-xs text-gray-400 font-medium">{item.meta}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-4xl text-center text-lg leading-8 text-gray-700">
            For any queries related to pujas, chadhava, astrology tools, or technical assistance, feel free to reach out to us. Our team is here to help you.
          </p>

          <div className="mt-10 flex justify-center">
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://play.google.com/store/search?q=astroved&c=apps"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-xl bg-[#6869F9] px-7 py-4 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg shadow-indigo-100 transition-all hover:bg-[#8283fa] active:scale-95"
              >
                <i className="fa-brands fa-google-play text-base" aria-hidden="true"></i>
                Android App
              </a>
              <a
                href="https://apps.apple.com/us/app/AstroVed-astrology-remedies/id1406242342"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-xl bg-[#6869F9] px-7 py-4 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg shadow-indigo-100 transition-all hover:bg-[#8283fa] active:scale-95"
              >
                <i className="fa-brands fa-apple text-base" aria-hidden="true"></i>
                iOS App
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
