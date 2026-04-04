import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { VenueEditor } from '../../components/venue';
import { usePartyLoader } from '../../hooks/usePartyLoader';
import { PartyAssistanceService } from '../../services/party-assistance.service';
import { useUsersStore } from '../../stores/users.store';

export const VenueEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { partyUuid } = useParams<{ partyUuid: string }>();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid') || partyUuid || '';
  const { fullParty } = usePartyLoader(p_uuid);
  const { getUsersByIds } = useUsersStore();
  const [guests, setGuests] = useState<Array<{ id: string; name: string; photoURL?: string }>>([]);

  useEffect(() => {
    if (!p_uuid || !fullParty) return;
    PartyAssistanceService.getAssistancesByParty(p_uuid)
      .then(async (assistances) => {
        const confirmed = assistances.filter((a) => a.attendanceConfirmed);
        const ids = [...new Set(confirmed.map((a) => a.guest_user_id))];
        if (!ids.length) return;
        const map = await getUsersByIds(ids);
        setGuests(Array.from(map.entries()).map(([id, u]) => ({ id, name: `${u.name} ${u.lastName}`.trim(), photoURL: u.photoURL || u.avatar })));
      })
      .catch(() => {});
  }, [p_uuid, fullParty, getUsersByIds]);

  return (
    <VenueEditor
      partyUuid={p_uuid}
      partyTitle={fullParty?.title || 'Fiesta'}
      confirmedGuests={guests}
      onBack={() => navigate(-1)}
    />
  );
};
