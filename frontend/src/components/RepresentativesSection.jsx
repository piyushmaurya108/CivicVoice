import { useMemo, useState } from 'react';
import {
  Users2,
  Mail,
  Phone,
  Twitter,
  Facebook,
  Instagram,
  ExternalLink,
  Copy,
  AlertTriangle,
  Megaphone
} from 'lucide-react';
import toast from 'react-hot-toast';
import { TYPE_LABELS } from '../utils/formatters.js';

// Pull a @handle out of a twitter/x URL, if present
function handleFromUrl(url) {
  if (!url) return null;
  const m = url.match(/(?:twitter\.com|x\.com)\/([A-Za-z0-9_]+)/i);
  return m ? `@${m[1]}` : null;
}

function RepCard({ rep }) {
  if (!rep) return null;
  const socials = [
    { url: rep.twitter, icon: Twitter, label: 'Twitter/X' },
    { url: rep.facebook, icon: Facebook, label: 'Facebook' },
    { url: rep.instagram, icon: Instagram, label: 'Instagram' }
  ].filter((s) => s.url);

  return (
    <div className="flex flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-brand-700">
        {rep.role}
      </div>
      <div className="mt-1 text-base font-semibold text-gray-900">{rep.name}</div>
      {rep.party && <div className="text-sm text-gray-600">{rep.party}</div>}
      {rep.constituency && (
        <div className="mt-0.5 text-xs text-gray-500">{rep.constituency}</div>
      )}

      <div className="mt-3 flex flex-col gap-1.5 text-sm">
        {rep.email && (
          <a
            href={`mailto:${rep.email}`}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-brand-700"
          >
            <Mail size={14} aria-hidden /> {rep.email}
          </a>
        )}
        {rep.phone && (
          <a
            href={`tel:${rep.phone}`}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-brand-700"
          >
            <Phone size={14} aria-hidden /> {rep.phone}
          </a>
        )}
      </div>

      {socials.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {socials.map(({ url, icon: Icon, label }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white p-1.5 text-gray-600 hover:bg-gray-50 hover:text-brand-700"
            >
              <Icon size={15} aria-hidden />
            </a>
          ))}
        </div>
      )}

      {rep.directoryUrl && (
        <a
          href={rep.directoryUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 hover:underline"
        >
          <ExternalLink size={12} aria-hidden /> Official directory
        </a>
      )}

      {rep.note && <p className="mt-2 text-xs text-gray-500">{rep.note}</p>}
    </div>
  );
}

/**
 * "Contact Your Representatives" section (Change 6).
 * Props: data = { cards: { mp, mla, mayor }, meta }, type, address
 */
export default function RepresentativesSection({ data, type, address }) {
  const [copied, setCopied] = useState(false);
  const cards = data?.cards;
  const typeLabel = (TYPE_LABELS[type] || 'civic issue').toLowerCase();
  const place =
    [address?.locality, address?.city, address?.state].filter(Boolean).join(', ') ||
    'my area';

  const tweet = useMemo(() => {
    if (!cards) return '';
    const handles = [cards.mp, cards.mla, cards.mayor]
      .map((r) => handleFromUrl(r?.twitter))
      .filter(Boolean);
    const tags = handles.length ? ` ${handles.join(' ')}` : '';
    return `Urgent: ${typeLabel} in ${place} needs immediate attention from the authorities. Citizens deserve basic civic infrastructure.${tags} #CivicVoice #FixOurCity`;
  }, [cards, typeLabel, place]);

  if (!cards) return null;

  const copyTweet = async () => {
    try {
      await navigator.clipboard.writeText(tweet);
      setCopied(true);
      toast.success('Tweet copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy. Please select and copy manually.');
    }
  };

  const tweetIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Users2 size={18} className="text-brand-700" aria-hidden />
        <h3 className="text-base font-semibold text-gray-900">Contact Your Representatives</h3>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <RepCard rep={cards.mp} />
        <RepCard rep={cards.mla} />
        <RepCard rep={cards.mayor} />
      </div>

      {/* Pre-written tweet */}
      <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Megaphone size={15} aria-hidden /> Raise it on X / Twitter
        </div>
        <p className="whitespace-pre-wrap rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-800">
          {tweet}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyTweet}
            className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Copy size={14} aria-hidden /> {copied ? 'Copied!' : 'Copy tweet'}
          </button>
          <a
            href={tweetIntent}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Twitter size={14} aria-hidden /> Post to X
          </a>
        </div>
      </div>

      {/* Verification warning (Change 6) */}
      <p className="mt-3 flex items-start gap-1.5 text-xs text-amber-700">
        <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" aria-hidden />
        <span>
          Social-media handles change after elections — please verify each handle on the
          official website before tagging.
          {data?.meta?.lastUpdated ? ` Representative data last updated: ${data.meta.lastUpdated}.` : ''}
        </span>
      </p>
    </section>
  );
}
