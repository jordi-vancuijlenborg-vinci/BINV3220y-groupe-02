import { useState } from "react";
import type { Application } from "../models/application.ts";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONES,
} from "../utils/labels.ts";
import StatusBadge from "./StatusBadge.tsx";

interface ApplicationTableProps {
  applications: Application[];
  onWithdraw: (applicationId: number) => Promise<void>;
}

const formatDate = (value: string): string => {
  const date = value.slice(0, 10).split("-");
  return date.length === 3 ? `${date[2]}/${date[1]}/${date[0]}` : value;
};

const ApplicationTable = ({ applications, onWithdraw }: ApplicationTableProps) => (
  <div className="table-wrapper">
    <table className="data-table">
      <thead>
        <tr>
          <th scope="col">Offre</th>
          <th scope="col">Entreprise</th>
          <th scope="col">Date</th>
          <th scope="col">Message</th>
          <th scope="col">Statut</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        {applications.map((application) => (
          <tr key={application.id}>
            <td>{application.offerTitle}</td>
            <td>{application.companyShortName}</td>
            <td>{formatDate(application.appliedAt)}</td>
            <td>{application.message ?? "—"}</td>
            <td>
              <StatusBadge
                label={APPLICATION_STATUS_LABELS[application.status]}
                tone={APPLICATION_STATUS_TONES[application.status]}
              />
            </td>
            <td>
              {application.status === "IN_PROGRESS" && (
                <WithdrawButton applicationId={application.id} onWithdraw={onWithdraw} />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

interface WithdrawButtonProps {
  applicationId: number;
  onWithdraw: (applicationId: number) => Promise<void>;
}

const WithdrawButton = ({ applicationId, onWithdraw }: WithdrawButtonProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await onWithdraw(applicationId);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Retrait de la candidature impossible");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button type="button" onClick={handleClick} disabled={isSubmitting}>
        {isSubmitting ? "Retrait…" : "Retirer"}
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
};

export default ApplicationTable;
