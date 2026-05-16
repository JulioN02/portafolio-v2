import { useNavigate } from 'react-router-dom';
import { ServiceForm } from '../../components/services/ServiceForm';
import { useServices } from '../../hooks/useServices';
import { ServiceInput } from '@jsoft/shared';

export function ServiceCreatePage() {
  const navigate = useNavigate();
  const { useCreate } = useServices();
  const createMutation = useCreate();

  const handleSubmit = (data: ServiceInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        navigate('/services');
      },
    });
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Create Service</h1>
      <ServiceForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
    </div>
  );
}