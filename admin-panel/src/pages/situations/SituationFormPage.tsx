import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loading } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { useSituations } from '../../hooks/useSituations';
import { servicesApi } from '../../api/services.api';
import { getApiErrorMessage } from '../../utils/apiError';
import formStyles from '../../styles/form.module.css';

const MAX_SERVICES = 3;

export function SituationFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const { useGetById, useCreate, useUpdate } = useSituations();
  const { data: existing, isLoading } = useGetById(id ?? '');
  const create = useCreate();
  const update = useUpdate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [order, setOrder] = useState(0);
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [services, setServices] = useState<Array<{ id: string; title: string; status: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    servicesApi.getAll({ status: 'ALL', page: 1, limit: 100 })
      .then((result) => setServices(result.data.map((s) => ({ id: s.id, title: s.title, status: s.status }))))
      .catch(() => setServices([]));
  }, []);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setDescription(existing.description);
      setActive(existing.active);
      setOrder(existing.order);
      setServiceIds(existing.services.map((s) => s.id));
    }
  }, [existing]);

  if (isEdit && isLoading) return <Loading />;

  const toggleService = (serviceId: string) => {
    setServiceIds((current) => {
      if (current.includes(serviceId)) return current.filter((value) => value !== serviceId);
      if (current.length >= MAX_SERVICES) return current;
      return [...current, serviceId];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (title.trim().length === 0 || description.trim().length === 0) {
      setError(t('situations.requiredFields'));
      return;
    }

    const onSuccess = () => navigate('/situations');
    const onError = (err: unknown) => setError(getApiErrorMessage(err));

    if (isEdit && id) {
      update.mutate(
        { id, data: { title, description, active, order, serviceIds } },
        { onSuccess, onError },
      );
    } else {
      create.mutate({ title, description, active, order, serviceIds }, { onSuccess, onError });
    }
  };

  const isSaving = create.isPending || update.isPending;

  return (
    <div className={formStyles.adminContainer}>
      <div className={formStyles.pageHeader}>
        <h1 className={formStyles.pageTitle}>
          {isEdit ? t('situations.edit') : t('situations.create')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className={formStyles.formCard}>
        {error && <p className={formStyles.formError} role="alert">{error}</p>}

        <fieldset className={formStyles.formSection}>
          <legend className={formStyles.sectionTitle}>{t('situations.details')}</legend>
          <div className={formStyles.formGroup}>
            <label className={formStyles.formLabel} htmlFor="title">{t('situations.name')}</label>
            <input
              id="title"
              className={formStyles.formInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              required
            />
          </div>
          <div className={formStyles.formGroup}>
            <label className={formStyles.formLabel} htmlFor="description">{t('situations.descriptionField')}</label>
            <textarea
              id="description"
              className={formStyles.formTextarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              required
            />
            <p className={formStyles.hint}>{t('situations.descriptionHint')}</p>
          </div>
          <div className={formStyles.fieldRow}>
            <div className={formStyles.formGroup}>
              <label className={formStyles.formLabel} htmlFor="order">{t('situations.order')}</label>
              <input
                id="order"
                type="number"
                min={0}
                max={10000}
                className={formStyles.formInput}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
              />
            </div>
            <div className={formStyles.formGroup}>
              <label className={formStyles.checkboxLabel} htmlFor="active">
                <input
                  id="active"
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
                {t('situations.active')}
              </label>
            </div>
          </div>
        </fieldset>

        <fieldset className={formStyles.formSection}>
          <legend className={formStyles.sectionTitle}>{t('situations.services')}</legend>
          <p className={formStyles.hint}>
            {t('situations.servicesHint')} ({serviceIds.length}/{MAX_SERVICES})
          </p>
          {serviceIds.length >= MAX_SERVICES && (
            <p className={formStyles.hint} role="status">{t('situations.limitReached')}</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '320px', overflowY: 'auto' }}>
            {services.map((service) => {
              const checked = serviceIds.includes(service.id);
              const disabled = !checked && serviceIds.length >= MAX_SERVICES;
              return (
                <label key={service.id} className={formStyles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleService(service.id)}
                  />
                  {service.title} <span className={formStyles.hint}>({service.status})</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className={formStyles.buttonRow}>
          <button type="button" className={formStyles.btnSecondary} onClick={() => navigate('/situations')}>
            {t('common.cancel')}
          </button>
          <button type="submit" className={formStyles.btnPrimary} disabled={isSaving}>
            {isSaving ? t('form.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
