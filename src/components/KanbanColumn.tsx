"use client";

import { Draggable, Droppable } from "@hello-pangea/dnd";
import { DealCard } from "@/components/DealCard";
import type { DealStage, DealWithContact } from "@/lib/database.types";

type KanbanColumnProps = {
  stage: DealStage;
  title: string;
  deals: DealWithContact[];
  onAddDeal: (stage: DealStage) => void;
  onEditDeal: (deal: DealWithContact) => void;
  onMarkContacted: (deal: DealWithContact) => void;
  followUpDelayDays: number;
};

export function KanbanColumn({ stage, title, deals, onAddDeal, onEditDeal, onMarkContacted, followUpDelayDays }: KanbanColumnProps) {
  return (
    <section className="flex min-h-[320px] min-w-[260px] flex-1 flex-col rounded-lg border border-zinc-200 bg-zinc-50">
      <header className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-950">{title}</h2>
          <p className="text-xs text-zinc-500">
            {deals.length} {deals.length > 1 ? "deals" : "deal"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onAddDeal(stage)}
          className="rounded-md bg-zinc-950 px-3 py-2 text-xs font-medium text-white transition hover:bg-zinc-800"
        >
          Ajouter un deal
        </button>
      </header>

      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-1 flex-col gap-3 p-3 transition ${
              snapshot.isDraggingOver ? "bg-zinc-100" : "bg-transparent"
            }`}
          >
            {deals.map((deal, index) => (
              <Draggable key={deal.id} draggableId={deal.id} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    className={dragSnapshot.isDragging ? "opacity-80" : undefined}
                  >
                    <DealCard
                      deal={deal}
                      followUpDelayDays={followUpDelayDays}
                      onEdit={onEditDeal}
                      onMarkContacted={onMarkContacted}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </section>
  );
}
