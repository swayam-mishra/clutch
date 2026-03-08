import { Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Designer",
    avatar:
      "https://images.unsplash.com/photo-1655249481446-25d575f1c054?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyOTExMzYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    quote:
      "Clutch told me I'd run out of my dining budget by the 20th. I adjusted and saved $180 that month.",
  },
  {
    name: "Marcus Johnson",
    role: "Software Engineer",
    avatar:
      "https://images.unsplash.com/photo-1723537742563-15c3d351dbf2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBoZWFkc2hvdCUyMGJ1c2luZXNzfGVufDF8fHx8MTc3Mjg5MDk0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    quote:
      "The AI Purchase Advisor is a game-changer. It talked me out of a $300 gadget I didn't need.",
  },
  {
    name: "Emily Rodriguez",
    role: "Freelance Writer",
    avatar:
      "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwc21pbGluZyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MzAwNzU4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    quote:
      "I've tried every budget app out there. Clutch is the first one that actually prevents overspending.",
  },
];

export function Testimonials() {
  return (
    <section className="py-24" style={{ backgroundColor: "#EDE9FF" }}>
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p
            className="inline-block px-4 py-1.5 rounded-full mb-4"
            style={{
              backgroundColor: "#fff",
              color: "#6C47FF",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Testimonials
          </p>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "#1A1A2E",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            Loved by people who{" "}
            <span style={{ color: "#6C47FF" }}>love their money</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="p-8 rounded-2xl flex flex-col gap-5"
              style={{
                backgroundColor: "#fff",
                boxShadow: "0 2px 12px rgba(108,71,255,0.08)",
                borderRadius: 16,
              }}
            >
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    fill="#F59E0B"
                    color="#F59E0B"
                  />
                ))}
              </div>
              <p
                style={{
                  fontSize: 15,
                  color: "#1A1A2E",
                  lineHeight: 1.7,
                  opacity: 0.8,
                  flex: 1,
                }}
              >
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-[#EDE9FF]">
                <ImageWithFallback
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1A1A2E",
                    }}
                  >
                    {t.name}
                  </p>
                  <p style={{ fontSize: 12, color: "#1A1A2E", opacity: 0.5 }}>
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
