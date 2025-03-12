import { ponder } from "ponder:registry";

ponder.on(
  "Banny721TokenUriResolver:DecorateBanny",
  async ({ event, context }) => {
    console.log(event.args);
  },
);

ponder.on(
  "Banny721TokenUriResolver:OwnershipTransferred",
  async ({ event, context }) => {
    console.log(event.args);
  },
);

ponder.on(
  "Banny721TokenUriResolver:SetProductName",
  async ({ event, context }) => {
    console.log(event.args);
  },
);

ponder.on(
  "Banny721TokenUriResolver:SetSvgBaseUri",
  async ({ event, context }) => {
    console.log(event.args);
  },
);
