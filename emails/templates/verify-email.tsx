import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface VerifyEmailProps {
  userEmail: string;
  verifyUrl: string;
  locale?: string;
}

export const VerifyEmailTemplate = ({
  userEmail,
  verifyUrl,
  locale = "en",
}: VerifyEmailProps) => {
  const messages = {
    en: {
      previewText: "Verify your email address to access the wisdom of Hermes Trismegistus",
      title: "Welcome to IALchemist",
      greeting: "Greetings, seeker of wisdom",
      message: "Your journey into the ancient mysteries begins here. To access the teachings of Hermes Trismegistus, please verify your email address.",
      buttonText: "Verify Email Address",
      footer: "If you did not create an account, please ignore this email.",
      quote: "\"As above, so below; as within, so without\"",
      attribution: "— The Emerald Tablet",
    },
    es: {
      previewText: "Verifica tu dirección de correo para acceder a la sabiduría de Hermes Trismegisto",
      title: "Bienvenido a IALchemist",
      greeting: "Saludos, buscador de sabiduría",
      message: "Tu viaje a los antiguos misterios comienza aquí. Para acceder a las enseñanzas de Hermes Trismegisto, por favor verifica tu dirección de correo.",
      buttonText: "Verificar Correo Electrónico",
      footer: "Si no creaste una cuenta, por favor ignora este correo.",
      quote: "\"Como arriba, así abajo; como dentro, así fuera\"",
      attribution: "— La Tabla Esmeralda",
    },
    fr: {
      previewText: "Vérifiez votre adresse e-mail pour accéder à la sagesse d'Hermès Trismégiste",
      title: "Bienvenue sur IALchemist",
      greeting: "Salutations, chercheur de sagesse",
      message: "Votre voyage dans les mystères anciens commence ici. Pour accéder aux enseignements d'Hermès Trismégiste, veuillez vérifier votre adresse e-mail.",
      buttonText: "Vérifier l'adresse e-mail",
      footer: "Si vous n'avez pas créé de compte, veuillez ignorer cet e-mail.",
      quote: "\"Ce qui est en haut comme ce qui est en bas; ce qui est à l'intérieur comme ce qui est à l'extérieur\"",
      attribution: "— La Table d'Émeraude",
    },
  };

  const t = messages[locale as keyof typeof messages] || messages.en;

  return (
    <Html>
      <Head />
      <Preview>{t.previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <div style={logo}>☿</div>
            <Text style={title}>{t.title}</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={greeting}>{t.greeting},</Text>
            <Text style={paragraph}>{t.message}</Text>

            {/* Verification Button */}
            <Section style={buttonContainer}>
              <Link href={verifyUrl} style={button}>
                {t.buttonText}
              </Link>
            </Section>

            {/* Quote */}
            <Section style={quoteSection}>
              <Text style={quote}>{t.quote}</Text>
              <Text style={attribution}>{t.attribution}</Text>
            </Section>

            {/* Footer */}
            <Text style={footer}>{t.footer}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#0f0f23",
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  color: "#ffffff",
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const header = {
  textAlign: "center" as const,
  padding: "32px 0",
  borderBottom: "1px solid #fbbf24",
};

const logo = {
  fontSize: "48px",
  color: "#fbbf24",
  marginBottom: "16px",
};

const title = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#fbbf24",
  margin: "0",
};

const content = {
  padding: "32px 24px",
};

const greeting = {
  fontSize: "18px",
  fontWeight: "500",
  color: "#fbbf24",
  margin: "0 0 16px 0",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#d1d5db",
  margin: "0 0 24px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#d97706",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
  border: "none",
  cursor: "pointer",
};

const quoteSection = {
  backgroundColor: "rgba(0, 0, 0, 0.3)",
  padding: "24px",
  borderRadius: "8px",
  border: "1px solid #fbbf24",
  margin: "32px 0",
  textAlign: "center" as const,
};

const quote = {
  fontSize: "16px",
  fontStyle: "italic",
  color: "#fbbf24",
  margin: "0 0 8px 0",
};

const attribution = {
  fontSize: "14px",
  color: "#9ca3af",
  margin: "0",
};

const footer = {
  fontSize: "14px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "24px 0 0 0",
};

export default VerifyEmailTemplate;