import { useParams, useNavigate } from 'react-router-dom';
import { ToolForm } from '../../components/tools/ToolForm';
import { useTools } from '../../hooks/useTools';
import { ToolInput } from '@jsoft/shared';

export function ToolEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useGetById, useUpdate } = useTools();
  const { data: tool, isLoading } = useGetById(id!);
  const updateMutation = useUpdate();

  const handleSubmit = (data: ToolInput) => {
    updateMutation.mutate(
      { id: id!, data },
      {
        onSuccess: () => {
          navigate('/tools');
        },
      }
    );
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  if (!tool) return <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>Tool not found</div>;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Edit Tool</h1>
      <ToolForm initialData={tool} onSubmit={handleSubmit} isLoading={updateMutation.isPending} />
    </div>
  );
}