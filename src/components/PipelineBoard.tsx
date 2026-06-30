"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useMemo, useState } from "react";
import { AddDealModal } from "@/components/AddDealModal";
import { EditDealModal } from "@/components/EditDealModal";
import { KanbanColumn } from "@/components/KanbanColumn";
import type { Contact, DealStage, DealWithContact } from "@/lib/database.types";
import { getStageLabel } from "@/lib/format";
import { markDealContacted, updateDealStage, visiblePipelineStages } from "@/lib/deals";

type PipelineBoardProps = {
  initialDeals: DealWithContact[];
  contacts: Contact[];
  followUpDelayDays: number;
};

export function PipelineBoard({ initialDeals, contacts, followUpDelayDays }: PipelineBoardProps) {
  const [deals, setDeals] = useState(initialDeals);
  const [modalStage, setModalStage] = useState<DealStage>("prospect");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<DealWithContact | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dealsByStage = useMemo(() => {
    return visiblePipelineStages.reduce<Record<DealStage, DealWithContact[]>>(
      (groups, stage) => {
        groups[stage] = deals.filter((deal) => (deal.stage ?? "prospect") === stage);
        return groups;
      },
      {
        prospect: [],
        discussion: [],
        devis: [],
        gagne: [],
        perdu: [],
      },
    );
  }, [deals]);

  function openAddDeal(stage: DealStage) {
    setModalStage(stage);
    setIsModalOpen(true);
  }

  async function handleDragEnd(result: DropResult) {
    const { destination, draggableId, source } = result;

    if (!destination) {
      return;
    }

    const nextStage = destination.droppableId as DealStage;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const previousDeals = deals;
    setError(null);

    // Mise a jour optimiste pour donner une reponse immediate au glisser-deposer.
    setDeals((currentDeals) =>
      currentDeals.map((deal) =>
        deal.id === draggableId ? { ...deal, stage: nextStage } : deal,
      ),
    );

    const resultUpdate = await updateDealStage(draggableId, nextStage);

    if (resultUpdate.error) {
      setDeals(previousDeals);
      setError(resultUpdate.error);
    }
  }

  async function handleMarkContacted(deal: DealWithContact) {
    setError(null);
    const previousDeals = deals;
    const nowIso = new Date().toISOString();

    // Mise a jour optimiste : l'horloge "jours sans contact" repart a zero tout de suite.
    setDeals((currentDeals) =>
      currentDeals.map((item) =>
        item.id === deal.id ? { ...item, last_contacted_at: nowIso } : item,
      ),
    );

    const result = await markDealContacted(deal.id);

    if (result.error || !result.deal) {
      setDeals(previousDeals);
      setError(result.error ?? "Impossible d'enregistrer la relance.");
      return;
    }

    const updated = result.deal;
    setDeals((currentDeals) =>
      currentDeals.map((item) => (item.id === deal.id ? updated : item)),
    );
  }

  return (
    <>
      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible">
          {visiblePipelineStages.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              title={getStageLabel(stage)}
              deals={dealsByStage[stage]}
              onAddDeal={openAddDeal}
              onEditDeal={setEditingDeal}
              onMarkContacted={handleMarkContacted}
              followUpDelayDays={followUpDelayDays}
            />
          ))}
        </div>
      </DragDropContext>

      {isModalOpen ? (
        <AddDealModal
          contacts={contacts}
          initialStage={modalStage}
          onClose={() => setIsModalOpen(false)}
          onDealCreated={(deal) => setDeals((currentDeals) => [deal, ...currentDeals])}
        />
      ) : null}

      {editingDeal ? (
        <EditDealModal
          deal={editingDeal}
          contacts={contacts}
          onClose={() => setEditingDeal(null)}
          onUpdated={(updated) =>
            setDeals((currentDeals) =>
              currentDeals.map((item) => (item.id === updated.id ? updated : item)),
            )
          }
          onDeleted={(dealId) =>
            setDeals((currentDeals) => currentDeals.filter((item) => item.id !== dealId))
          }
        />
      ) : null}
    </>
  );
}
