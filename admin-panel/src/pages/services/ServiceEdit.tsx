import { useParams, useNavigate } from 'react-router-dom';
import { ServiceForm } from '../../components/services/ServiceForm';
import { useServices } from '../../hooks/useServices';
import { ServiceInput } from '@jsoft/shared';

export function ServiceEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useGetById, useUpdate } = useServices();
  const { data: service, isLoading } = useGetById(id!);
  const updateMutation = useUpdate();

  const handleSubmit = (data: ServiceInput) => {
    updateMutation.mutate(
      { id: id!, data },
      {
        onSuccess: () => {
          navigate('/services');
        },
      }
    );
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  if (!service) return <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>Service not found</div>;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Edit Service</h1>
      <ServiceForm initialData={service} onSubmit={handleSubmit} isLoading={updateMutation.isPending} />
    </div>
  );
}