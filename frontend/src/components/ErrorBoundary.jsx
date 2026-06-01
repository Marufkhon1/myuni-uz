import { Component } from "react";
import { captureException, Sentry } from "../lib/sentry.js";
import StatusPageLayout, {
  StatusPrimaryButton,
  StatusSecondaryButton,
} from "./ui/StatusPageLayout.jsx";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, eventId: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("UI xatosi:", error, info);
    captureException(error, { extra: { componentStack: info?.componentStack } });
    const eventId = typeof Sentry.lastEventId === "function" ? Sentry.lastEventId() : null;
    if (eventId) {
      this.setState({ eventId });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <StatusPageLayout
          variant="error"
          eyebrow="Xatolik"
          title="Kutilmagan xatolik"
          description={
            this.state.eventId
              ? `Sahifani yangilab ko'ring yoki bosh sahifaga qayting. Xato kodi: ${this.state.eventId}`
              : "Sahifani yangilab ko'ring yoki bosh sahifaga qayting. Muammo takrorlansa, biz bilan bog'laning."
          }
          primaryAction={
            <StatusPrimaryButton type="button" onClick={() => window.location.reload()}>
              Sahifani yangilash
            </StatusPrimaryButton>
          }
          secondaryAction={<StatusSecondaryButton to="/">Bosh sahifaga</StatusSecondaryButton>}
        />
      );
    }

    return this.props.children;
  }
}
