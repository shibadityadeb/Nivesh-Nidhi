import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./tutorial.css";

const STEP_TARGETS = [
  {
    selectors: ["#exploreChitsBtn", "#exploreChitsBtnMobile"],
    popover: {
      title: "Explore Chits",
      description: "Browse active chit groups prioritized by your location.",
      side: "bottom",
    },
  },
  {
    selectors: ["#becomeOrganizerBtn"],
    popover: {
      title: "Become an Organizer",
      description: "Apply here to start and manage your own chit groups.",
      side: "bottom",
    },
  },
  {
    selectors: ["#profileBtn", "#profileBtnMobile"],
    popover: {
      title: "Profile",
      description: "Manage account settings and restart this tutorial anytime.",
      side: "left",
    },
  },
  {
    selectors: ["#aiAssistantBtn"],
    popover: {
      title: "AI Assistant",
      description: "Open Nidhi AI to get help with chit groups, auctions, and platform guidance.",
      side: "left",
    },
  },
  {
    selectors: ["#bellBtn"],
    popover: {
      title: "Notifications",
      description: "Check updates, announcements, and reminders from your groups.",
      side: "left",
    },
  },
];

const isVisible = (element) => {
  if (!element) return false;
  if (element.getClientRects().length === 0) return false;
  const style = window.getComputedStyle(element);
  return style.visibility !== "hidden" && style.display !== "none";
};

const resolveStepElement = (selectors = []) => {
  for (const selector of selectors) {
    const matches = document.querySelectorAll(selector);
    for (const match of matches) {
      if (isVisible(match)) return match;
    }
  }
  return null;
};

export const startAppTutorial = () => {
  const steps = STEP_TARGETS.map((step) => {
    const element = resolveStepElement(step.selectors);
    if (!element) return null;
    return { element, popover: step.popover };
  }).filter(Boolean);

  if (steps.length === 0) return false;

  const driverObj = driver({
    showProgress: true,
    allowClose: true,
    nextBtnText: "Next",
    prevBtnText: "Back",
    doneBtnText: "Finish",
    popoverClass: "nivesh-tutorial-popover",
    steps,
  });

  driverObj.drive();
  return true;
};
