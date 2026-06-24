"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useMemo, useState } from "react";
import { AddDealModal } from "@/components/AddDealModal";
import { KanbanColumn } from "@/components/KanbanColumn";
import type { Contact, DealStage, DealWithContact } from "@/lib/database.types";
import { getStageLabel } from "@/lib/format";
import { updateDealStage, visiblePipelineStages } from "@/lib/deals";

type PipelineBoardProps = {
  initialDeals: DealWithContact[];
  contacts: Contact[];
  followUpDelayDays: number;
};

export function PipelineBoard({ initialDeals, contacts, followUpDelayDays }: PipelineBoardProps) {
  const [deals, setDeals] = useState(initialDeals);
  const [modalStage, setModalStage] = useState<DealStage>("prospect");
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    </>
  );
}
