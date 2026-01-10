import { form } from "motion/react-client";
import emailjs from "@emailjs/browser";

export const Contact = () => {
  const sendEmail = (e) => {
    e.preventDefault();
    emailjs
      .sendForm(
        "service_bdylvn9",
        "template_37y0ikn",
        form.current,
        "BU70E01rQ2Qn-KjBC"
      )
      .then(
        () => {
          alert("Message sent successfully🚀");
          form.current.reset();
        },
        (error) => {
          alert("Failed to sent mail!👎", error.text);
          form.current.reset();
        }
      );
  };
  return (
    <div>
      <div className="margintb">
        <h2
          className="text-5xl font-extrabold text-center mt-0 mb-10 title-h1"
          id="contact"
        >
          GET IN TOUCH
        </h2>
        <div className="max-w-md mx-auto p-6 rounded-2xl bg-white/10 backdrop-blur-xs border mb-40 border-white/20 fade-up">
          <h2 className="text-2xl font-semibold text-white mb-6">Contact Me</h2>

          <form ref={form} onSubmit={sendEmail} className="flex flex-col gap-4">
            <input
              type="text"
              name="user_name"
              placeholder="Your Name"
              required
              className="px-4 py-3 rounded-lg bg-white/90 text-gray-900 outline-none
                     focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="email"
              name="user_email"
              placeholder="Your Email"
              required
              className="px-4 py-3 rounded-lg bg-white/90 text-gray-900 outline-none
                     focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="subject"
              placeholder="Your Subject"
              required
              className="px-4 py-3 rounded-lg bg-white/90 text-gray-900 outline-none
                     focus:ring-2 focus:ring-blue-500"
            />

            <textarea
              rows="4"
              name="message"
              placeholder="Your Message"
              required
              className="px-4 py-3 rounded-lg bg-white/90 text-gray-900 outline-none
                     focus:ring-2 focus:ring-blue-500 resize-none"
            />

            <button
              type="submit"
              className="mt-2 py-3 rounded-full font-extrabold text-white
                     bg-gradient-to-r from-blue-500 to-blue-700
                     hover:scale-[1.02] hover:shadow-blue-400 transition-transform"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
