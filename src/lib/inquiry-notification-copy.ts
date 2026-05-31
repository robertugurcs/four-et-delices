import type { Locale } from "@/i18n/config";

export const OWNER_INSPIRATION_REMINDER = {
  en: "Inspiration photo not uploaded. Ask the customer to send it via WhatsApp or email with their order reference.",
  fr: "Photo d'inspiration non téléversée. Demandez au client de l'envoyer par WhatsApp ou e-mail avec son numéro de commande.",
} as const satisfies Record<Locale, string>;

type CustomerEmailCopy = {
  subject: string;
  lead: string;
  sectionTitle: string;
  outro: string;
  inspirationReminder: string;
  notesLabel: string;
  noNotes: string;
  labels: {
    occasion: string;
    size: string;
    flavour: string;
    style: string;
    eventDate: string;
    delivery: string;
    notes: string;
  };
};

export const CUSTOMER_EMAIL_COPY: Record<Locale, CustomerEmailCopy> = {
  en: {
    subject: "Your inquiry with Four et Délices",
    lead:
      "Thank you for choosing Four et Délices! Cake Designer Khoudia here. I have personally received your cake inquiry.",
    sectionTitle: "Your request",
    outro:
      "I will reach out very soon to confirm every detail. Thank you for trusting us with your celebration.",
    inspirationReminder:
      "If you have inspiration photos, please reply to our WhatsApp message or email us with your order reference. I would love to see your vision!",
    notesLabel: "Notes",
    noNotes: "No additional notes.",
    labels: {
      occasion: "Occasion",
      size: "Size",
      flavour: "Flavour",
      style: "Style",
      eventDate: "Event date",
      delivery: "Delivery or pickup",
      notes: "Your notes",
    },
  },
  fr: {
    subject: "Votre demande avec Four et Délices",
    lead:
      "Merci d'avoir choisi Four et Délices ! Ici Khoudia, designer de gâteaux. J'ai bien reçu votre demande.",
    sectionTitle: "Votre demande",
    outro:
      "Je vous contacterai très bientôt pour confirmer chaque détail. Merci de votre confiance pour votre célébration.",
    inspirationReminder:
      "Si vous avez une photo d'inspiration, répondez à notre message WhatsApp ou envoyez-la par e-mail avec votre numéro de commande. J'aurais grand plaisir à découvrir votre idée !",
    notesLabel: "Notes",
    noNotes: "Aucune note supplémentaire.",
    labels: {
      occasion: "Occasion",
      size: "Taille",
      flavour: "Saveur",
      style: "Style",
      eventDate: "Date de l'événement",
      delivery: "Livraison ou retrait",
      notes: "Vos notes",
    },
  },
};
