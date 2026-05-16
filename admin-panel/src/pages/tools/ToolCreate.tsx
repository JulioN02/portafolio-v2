import { useNavigate } from 'react-router-dom';
import { ToolForm } from '../../components/tools/ToolForm';
import { useTools } from '../../hooks/useTools';
import { ToolInput } from '@jsoft/shared';

export function ToolCreatePage() {
  const navigate = useNavigate();
  const { useCreate } = useTools();
  const createMutation = useCreate();

  const handleSubmit = (data: ToolInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        navigate('/tools');
      },
    });
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Create Tool</h1>
      <ToolForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
    </div>
  );
}