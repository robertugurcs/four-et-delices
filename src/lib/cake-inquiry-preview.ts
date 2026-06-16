import {

  CUSTOM_FLAVOUR_OPTION,

  type Flavour,

  type Occasion,

  type Servings,

  type Style,

} from "@/lib/cake-inquiry-constants";

import type { Dictionary } from "@/i18n/types";



export type PreviewSegment = {

  text: string;

  highlight: boolean;

};



type PreviewCopy = Dictionary["inquiry"]["preview"];

type OptionCopy = Dictionary["inquiry"]["options"];



const occasionToWireframe = (

  copy: PreviewCopy,

): Record<Occasion, string> => ({

  Wedding: copy.wedding,

  Birthday: copy.birthday,

  "Baby shower": copy.babyShower,

  Graduation: copy.graduation,

  "Corporate event": copy.corporate,

  "Something else": copy.oneOfAKind,

});



const displayServings = (s: Servings) => s.replace("–", "-");



export function buildPreviewSegments(

  data: {

    occasion: Occasion | "";

    customOccasion?: string;

    servings: Servings | "";

    customServings?: string;

    flavour: Flavour | "";

    customFlavour?: string;

    style: Style | "";

  },

  copy: PreviewCopy,

  options: OptionCopy,

): PreviewSegment[] {

  const occasionWireframe = occasionToWireframe(copy);

  const segments: PreviewSegment[] = [

    { text: copy.creating, highlight: false },

  ];



  if (data.occasion) {

    if (data.occasion === "Something else") {

      const customOccasion = data.customOccasion?.trim();

      segments.push({

        text: customOccasion

          ? `${copy.oneOfAKindWithOccasion.replace("{occasion}", customOccasion.toLowerCase())}${copy.cake}`

          : `${occasionWireframe[data.occasion]}${copy.cake}`,

        highlight: true,

      });

    } else {

      segments.push({

        text: `${occasionWireframe[data.occasion]}${copy.cake}`,

        highlight: true,

      });

    }

  } else {

    segments.push({ text: copy.dreamCake, highlight: false });

  }



  segments.push({ text: copy.for, highlight: false });



  if (data.servings) {

    const customServings = data.customServings?.trim();

    segments.push({

      text:

        data.servings === "More"

          ? customServings

            ? copy.people.replace("{count}", customServings)

            : copy.largerGroup

          : copy.people.replace("{count}", displayServings(data.servings)),

      highlight: true,

    });

  } else {

    segments.push({ text: copy.yourParty, highlight: false });

  }



  if (!data.flavour && !data.style) {

    segments.push({ text: copy.defaultFlavourAndStyle, highlight: false });

  } else {

    segments.push({ text: copy.with, highlight: false });



    if (!data.flavour) {

      segments.push({ text: copy.chosenFlavour, highlight: false });

    } else if (data.flavour === CUSTOM_FLAVOUR_OPTION) {

      const custom = data.customFlavour?.trim();

      if (custom) {

        segments.push({ text: custom.toLowerCase(), highlight: true });

        segments.push({ text: copy.flavourSuffix, highlight: false });

      } else {

        segments.push({ text: copy.customFlavourChoice, highlight: false });

      }

    } else {

      segments.push({

        text: options.flavours[data.flavour].toLowerCase(),

        highlight: true,

      });

      segments.push({ text: copy.flavourSuffix, highlight: false });

    }



    segments.push({ text: copy.in, highlight: false });



    if (!data.style) {

      segments.push({ text: copy.styleDefined, highlight: false });

    } else if (data.style === "Not sure yet") {

      segments.push({ text: copy.styleDecided, highlight: false });

    } else {

      segments.push({

        text: copy.stylePattern.replace(

          "{style}",

          options.styles[data.style].toLowerCase(),

        ),

        highlight: true,

      });

    }

  }



  const last = segments[segments.length - 1];

  last.text = `${last.text}.`;



  return segments;

}



/** @deprecated Use buildPreviewSegments for highlighted UI. */

export function buildPreviewSentence(

  data: {

    occasion: Occasion | "";

    customOccasion?: string;

    servings: Servings | "";

    customServings?: string;

    flavour: Flavour | "";

    customFlavour?: string;

    style: Style | "";

  },

  copy: PreviewCopy,

  options: OptionCopy,

): string {

  return buildPreviewSegments(data, copy, options)

    .map((s) => s.text)

    .join("");

}


