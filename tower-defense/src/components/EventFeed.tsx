import type { GameEvent } from '../../shared/game-data';

interface EventFeedProps {
  events: GameEvent[];
}

export const EventFeed = ({ events }: EventFeedProps) => (
  <section className="panel">
    <div className="panel-heading">
      <div>
        <p className="eyebrow">Match feed</p>
        <h2>Battle log</h2>
      </div>
    </div>

    <div className="event-feed">
      {events.length === 0 ? (
        <p className="empty-copy">Wave events will appear here.</p>
      ) : (
        events.map((event) => (
          <article key={event.id} className="event-item">
            <span className="event-type">{event.type.replaceAll('_', ' ')}</span>
            <p>{event.message}</p>
          </article>
        ))
      )}
    </div>
  </section>
);
