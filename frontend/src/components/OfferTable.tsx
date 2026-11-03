import { useState } from "react";
import type { Offer } from "../models/offer.ts";
import { OFFER_STATUS_LABELS, OFFER_STATUS_TONES, PERIOD_LABELS } from "../utils/labels.ts";
import StatusBadge from "./StatusBadge.tsx";

interface OfferTableProps {
  offers: Offer[];
  canApply?: boolean;
  applyingOfferId?: number | null;
  onApply?: (offerId: number, message: string) => Promise<void>;
}

const OfferTable = ({
  offers,
  canApply = false,
  applyingOfferId = null,
  onApply,
}: OfferTableProps) => (
  <div className="table-wrapper">
    <table className="data-table">
      <thead>
        <tr>
          <th scope="col">Titre</th>
          <th scope="col">Entreprise</th>
          <th scope="col">Année</th>
          <th scope="col">Période</th>
          <th scope="col">Statut</th>
          {canApply && <th scope="col">Action</th>}
        </tr>
      </thead>
      <tbody>
        {offers.map((offer) => (
          <tr key={offer.id}>
            <td>{offer.title}</td>
            <td>{offer.companyShortName}</td>
            <td>{offer.academicYear}</td>
            <td>{PERIOD_LABELS[offer.period]}</td>
            <td>
              <StatusBadge
                label={OFFER_STATUS_LABELS[offer.status]}
                tone={OFFER_STATUS_TONES[offer.status]}
              />
            </td>
            {canApply && (
              <td>
                <ApplicationForm
                  offerId={offer.id}
                  isSubmitting={applyingOfferId === offer.id}
                  onApply={onApply}
                />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

interface ApplicationFormProps {
  offerId: number;
  isSubmitting: boolean;
  onApply?: (offerId: number, message: string) => Promise<void>;
}

const ApplicationForm = ({ offerId, isSubmitting, onApply }: ApplicationFormProps) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onApply === undefined) return;
    setError(null);
    try {
      await onApply(offerId, message);
      setSubmitted(true);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Candidature impossible");
    }
  };

  if (submitted) return <p role="status">Candidature envoyée</p>;

  return (
    <form onSubmit={submit}>
      <label>
        Message (facultatif)
        <textarea
          aria-label={`Message pour ${offerId}`}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={1000}
          disabled={isSubmitting}
        />
      </label>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Envoi…" : "Candidater"}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
};

export default OfferTable;
