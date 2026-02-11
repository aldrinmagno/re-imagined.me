import { useEffect, useMemo, useState } from 'react';
import { getCvBullets, saveCvBullets } from '../../lib/cvBulletsApi';
import { generateCvBullets } from '../../lib/generateCvBullets';
import { deriveTransferableSkills } from '../../lib/deriveTransferableSkills';
import { getTransferableSkillsSnapshot, regenerateTransferableSkillsSnapshot } from '../../lib/transferableSkillsApi';
import { getImpactInventoryEntries } from '../../lib/impactInventoryApi';
import type { ImpactInventoryEntry } from '../../types/impactInventory';
import type { CvBulletsPayload } from '../../types/cvBullets';
import type { TransferableSkill, TransferableSkillsSnapshotRecord } from '../../types/transferableSkills';
import { useAuth } from '../../context/AuthContext';
import { useReportContext } from './ReportLayout';

const defaultBullets: CvBulletsPayload = { mostRelevant: [], supporting: [] };

const normalizeEntries = (entries: ImpactInventoryEntry[]) => entries.filter((entry) => entry.title || entry.actions || entry.outcomes);

const getRoleLabel = (roleTitle: string) => roleTitle || 'General';

const isBulletEmpty = (bullet: string) => !bullet.trim();

const copyText = async (value: string) => {
  if (!navigator?.clipboard) return false;
  await navigator.clipboard.writeText(value);
  return true;
};

function CVBulletsWidget() {
  const { user } = useAuth();
  const { reportContent } = useReportContext();
  const roleOptions = reportContent.futureRoles;
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>('');
  const [impactInventory, setImpactInventory] = useState<ImpactInventoryEntry[]>([]);
  const [transferableSkillsSnapshot, setTransferableSkillsSnapshot] = useState<TransferableSkillsSnapshotRecord | null>(null);
  const [bullets, setBullets] = useState<CvBulletsPayload>(defaultBullets);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const roleTitle = useMemo(() => {
    if (selectedRoleKey === 'general') {
      return 'General';
    }
    if (!selectedRoleKey && roleOptions.length > 0) {
      return roleOptions[0].title;
    }
    return roleOptions.find((role) => role.id === selectedRoleKey)?.title ?? '';
  }, [roleOptions, selectedRoleKey]);

  const canGenerate = impactInventory.length > 0 && roleTitle;

  useEffect(() => {
    if (selectedRoleKey) return;
    if (roleOptions.length > 0) {
      setSelectedRoleKey(roleOptions[0].id);
    } else {
      setSelectedRoleKey('general');
    }
  }, [roleOptions, selectedRoleKey]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);

      const inventoryData = await getImpactInventoryEntries(user.id);
      const entries = normalizeEntries(inventoryData?.entries ?? []);
      setImpactInventory(entries);

      try {
        const snapshot = await getTransferableSkillsSnapshot(user.id);
        setTransferableSkillsSnapshot(snapshot);
      } catch (snapshotError) {
        setError(snapshotError instanceof Error ? snapshotError.message : 'Unable to load skills snapshot.');
      }

      setLoading(false);
    };

    void loadData();
  }, [user]);

  useEffect(() => {
    const loadBullets = async () => {
      if (!user || !selectedRoleKey) return;
      setError(null);
      try {
        const record = await getCvBullets(user.id, selectedRoleKey);
        setBullets(record?.bullets ?? defaultBullets);
        setSavedAt(record?.updated_at ?? null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load CV bullets.');
      }
    };

    void loadBullets();
  }, [selectedRoleKey, user]);

  const handleGenerate = async () => {
    if (!user || !roleTitle) return;
    setGenerating(true);
    setError(null);

    let skills: TransferableSkill[] = transferableSkillsSnapshot?.skills ?? [];

    if (!skills.length && impactInventory.length) {
      const derived = deriveTransferableSkills(impactInventory);
      skills = derived.transferable_skills;
    }

    if (!transferableSkillsSnapshot && impactInventory.length) {
      try {
        const snapshot = await regenerateTransferableSkillsSnapshot(user.id, impactInventory);
        setTransferableSkillsSnapshot(snapshot);
        skills = snapshot.skills;
      } catch (snapshotError) {
        setError(snapshotError instanceof Error ? snapshotError.message : 'Unable to save skills snapshot.');
      }
    }

    const generated = generateCvBullets({
      roleTitle,
      impactInventory,
      transferableSkills: skills
    });

    setBullets(generated);
    setGenerating(false);
  };

  const handleBulletChange = (section: keyof CvBulletsPayload, index: number, value: string) => {
    setBullets((prev) => {
      const updated = { ...prev, [section]: [...prev[section]] };
      updated[section][index] = value;
      return updated;
    });
  };

  const handleAddBullet = (section: keyof CvBulletsPayload) => {
    setBullets((prev) => ({
      ...prev,
      [section]: [...prev[section], '']
    }));
  };

  const handleSave = async () => {
    if (!user || !selectedRoleKey) return;
    setSaving(true);
    setError(null);
    try {
      const cleaned: CvBulletsPayload = {
        mostRelevant: bullets.mostRelevant.filter((bullet) => !isBulletEmpty(bullet)),
        supporting: bullets.supporting.filter((bullet) => !isBulletEmpty(bullet))
      };
      const record = await saveCvBullets(user.id, selectedRoleKey, cleaned);
      setBullets(record.bullets);
      setSavedAt(record.updated_at);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save CV bullets.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Loading your CV bullet workspace...</p>
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">Outcome-driven CV bullets</p>
        <h2 className="text-lg font-semibold text-slate-900">Craft role-focused impact bullets in minutes.</h2>
        <p className="text-sm text-slate-600">
          Use your impact inventory and transferable skills to build editable bullets. Save drafts per role and copy as you go.
        </p>
      </header>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Target role</p>
          <select
            value={selectedRoleKey || (roleOptions[0]?.id ?? 'general')}
            onChange={(event) => setSelectedRoleKey(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          >
            {roleOptions.length > 0 ? (
              roleOptions.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.title}
                </option>
              ))
            ) : (
              <option value="general">General focus</option>
            )}
          </select>
          <p className="text-xs text-slate-500">Saved: {savedAt ? new Date(savedAt).toLocaleString() : 'Not yet saved'}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate || generating}
            className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          >
            {generating ? 'Generating...' : 'Generate bullets'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !selectedRoleKey}
            className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saving ? 'Saving...' : 'Save bullets'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      {!impactInventory.length && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
          Add entries to your Impact Inventory to generate tailored bullets.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {(['mostRelevant', 'supporting'] as const).map((section) => (
          <div key={section} className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">
                {section === 'mostRelevant' ? 'Most Relevant' : 'Supporting'}
              </p>
              <button
                type="button"
                onClick={() => handleAddBullet(section)}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                + Add bullet
              </button>
            </div>
            <div className="space-y-3">
              {bullets[section].length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-500">
                  No bullets yet. Generate or add your own.
                </div>
              )}
              {bullets[section].map((bullet, index) => (
                <div key={`${section}-${index}`} className="rounded-xl border border-slate-200 bg-white p-3">
                  <textarea
                    value={bullet}
                    onChange={(event) => handleBulletChange(section, index, event.target.value)}
                    rows={3}
                    className="w-full resize-none text-sm text-slate-700 focus:outline-none"
                    aria-label={`${getRoleLabel(roleTitle)} ${section} bullet ${index + 1}`}
                  />
                  <div className="mt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => copyText(bullet)}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CVBulletsWidget;
