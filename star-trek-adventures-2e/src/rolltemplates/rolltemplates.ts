import Handlebars from "handlebars";

import rollPostTemplate from "./templates/roll.hbs?raw"

import postWrapper from "./partials/postWrapper.hbs?raw"

Handlebars.registerPartial("postWrapper", postWrapper)

const postTemplates = {
  roll: Handlebars.compile(rollPostTemplate)
}

type CommonParams = {
  characterName: string;
}

type RollPost = {
  type: "roll",
  parameters: CommonParams & {
    equation: string,
    successes: number,
  }
};

type AnyPostTemplate = RollPost;

export const createRollTemplate = ({type, parameters}: AnyPostTemplate) => {
  const template = postTemplates[type];
  const postTemplate = template({
    ...parameters
  })
  return postTemplate;
}