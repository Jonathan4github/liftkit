import { useParams } from 'react-router-dom';
import { ExperimentDashboard } from '../components/ExperimentDashboard';

export function ExperimentPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return (
    <div className="exp">
      <ExperimentDashboard experimentId={id} />
    </div>
  );
}
