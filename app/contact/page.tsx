import Pane from "@/components/UI/Pane";
import SocialRow from "@/components/UI/SocialRow";
import Fortune from "@/components/UI/Fortune";
import Typewriter from "@/components/UI/TypeWriter";
import { socialLinks } from "@/lib/content";

export default function Contact() {
  return (
    <div className="flex flex-col gap-4 pt-6 pb-8 md:pt-8">
      <h1 className="font-patua_one text-5xl text-yellow md:text-6xl">
        Get In Touch
      </h1>
      <p className="max-w-2xl font-patua_one text-lg text-fg1 md:text-xl">
        Let&apos;s connect! Reach out through{" "}
        <span className="text-aqua">
          <Typewriter
            words={["GitHub", "GitLab", "LinkedIn", "Telegram", "Email"]}
            speed={20}
            wait={2000}
          />
        </span>
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Pane title="channels">
          <h2 className="mb-2 font-patua_one text-2xl text-fg0">channels</h2>
          <div className="flex flex-col">
            {socialLinks.map((social) => (
              <SocialRow key={social.name} social={social} />
            ))}
          </div>
        </Pane>

        <Pane title="fortune">
          <Fortune />
        </Pane>
      </div>
    </div>
  );
}
