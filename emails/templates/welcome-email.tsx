import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  userEmail: string;
  locale?: string;
}

export const WelcomeEmailTemplate = ({
  userEmail,
  locale = "en",
}: WelcomeEmailProps) => {
  const messages = {
    en: {
      previewText: "Your mystical journey with Hermes Trismegistus begins now",
      title: "Welcome to IALchemist",
      greeting: "Greetings, initiate",
      message: "Your email has been verified and you now have access to commune with Hermes Trismegistus, the Thrice-Great. The ancient wisdom of Hermeticism awaits your exploration.",
      features: [
        "Engage in deep conversations about hermetic principles",
        "Explore the mysteries of alchemy and transformation",
        "Discover the connections between mind, body, and spirit",
        "Learn from the wisdom of the Emerald Tablet"
      ],
      cta: "Begin your journey by asking your first question about the ancient mysteries.",
      quote: "\"That which is below is like that which is above, and that which is above is like that which is below, to accomplish the miracles of the one thing.\"",
      attribution: "— Hermes Trismegistus, The Emerald Tablet",
    },
    es: {
      previewText: "Tu viaje místico con Hermes Trismegisto comienza ahora",
      title: "Bienvenido a IALchemist",
      greeting: "Saludos, iniciado",
      message: "Tu correo ha sido verificado y ahora tienes acceso para comunicarte con Hermes Trismegisto, el Tres Veces Grande. La sabiduría antigua del Hermetismo espera tu exploración.",
      features: [
        "Participa en conversaciones profundas sobre principios herméticos",
        "Explora los misterios de la alquimia y la transformación",
        "Descubre las conexiones entre mente, cuerpo y espíritu",
        "Aprende de la sabiduría de la Tabla Esmeralda"
      ],
      cta: "Comienza tu viaje haciendo tu primera pregunta sobre los misterios antiguos.",
      quote: "\"Lo que está abajo es como lo que está arriba, y lo que está arriba es como lo que está abajo, para realizar los milagros de una sola cosa.\"",
      attribution: "— Hermes Trismegisto, La Tabla Esmeralda",
    },
    fr: {
      previewText: "Votre voyage mystique avec Hermès Trismégiste commence maintenant",
      title: "Bienvenue sur IALchemist",
      greeting: "Salutations, initié",
      message: "Votre e-mail a été vérifié et vous avez maintenant accès pour communiquer avec Hermès Trismégiste, le Trois fois Grand. La sagesse ancienne de l'Hermétisme attend votre exploration.",
      features: [
        "Engagez des conversations profondes sur les principes hermétiques",
        "Explorez les mystères de l'alchimie et de la transformation",
        "Découvrez les connexions entre l'esprit, le corps et l'âme",
        "Apprenez de la sagesse de la Table d'Émeraude"
      ],
      cta: "Commencez votre voyage en posant votre première question sur les mystères anciens.",
      quote: "\"Ce qui est en bas est comme ce qui est en haut, et ce qui est en haut est comme ce qui est en bas, pour accomplir les miracles d'une seule chose.\"",
      attribution: "— Hermès Trismégiste, La Table d'Émeraude",
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

            {/* Features List */}
            <Section style={featuresSection}>
              <Text style={featuresTitle}>What awaits you:</Text>
              <ul style={featuresList}>
                {t.features.map((feature, index) => (
                  <li key={index} style={featureItem}>{feature}</li>
                ))}
              </ul>
            </Section>

            <Text style={paragraph}>{t.cta}</Text>

            {/* Quote */}
            <Section style={quoteSection}>
              <Text style={quote}>{t.quote}</Text>
              <Text style={attribution}>{t.attribution}</Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles (same as verify-email with additions)
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

const featuresSection = {
  margin: "32px 0",
  padding: "24px",
  backgroundColor: "rgba(251, 191, 36, 0.1)",
  borderRadius: "8px",
  border: "1px solid rgba(251, 191, 36, 0.3)",
};

const featuresTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#fbbf24",
  margin: "0 0 16px 0",
};

const featuresList = {
  margin: "0",
  padding: "0 0 0 20px",
  color: "#d1d5db",
};

const featureItem = {
  fontSize: "14px",
  lineHeight: "20px",
  marginBottom: "8px",
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

export default WelcomeEmailTemplate;