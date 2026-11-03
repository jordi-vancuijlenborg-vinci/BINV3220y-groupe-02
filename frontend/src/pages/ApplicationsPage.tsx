import ApplicationTable from "../components/ApplicationTable.tsx";
import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import { useApplications } from "../hooks/useApplications.ts";

interface ApplicationsPageProps {
  token: string;
  onUnauthorized: () => void;
}

const ApplicationsPage = ({ token, onUnauthorized }: ApplicationsPageProps) => {
  const { applications, isLoading, error, withdrawApplication } = useApplications(
    token,
    onUnauthorized,
  );

  if (error) return <ErrorState message={error} />;
  if (isLoading) return <LoadingState />;
  if (applications.length === 0) {
    return (
      <section>
        <h1>Mes candidatures</h1>
        <EmptyState message="Aucune candidature à afficher." />
      </section>
    );
  }

  return (
    <section>
      <h1>Mes candidatures</h1>
      <ApplicationTable applications={applications} onWithdraw={withdrawApplication} />
    </section>
  );
};

export default ApplicationsPage;
