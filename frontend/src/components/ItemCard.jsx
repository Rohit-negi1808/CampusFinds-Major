import React from 'react';
import { truncateText, formatDate, capitalizeFirstLetter, getImageUrl } from '../utils';

const CATEGORY_ICONS = {
  electronics: '💻',
  books: '📚',
  clothing: '👕',
  accessories: '👜',
  keys: '🔑',
  wallet: '👛',
  phone: '📱',
  id: '🪪',
  sports: '⚽',
  other: '📦',
};

const getCategoryIcon = (category) => {
  const key = (category || '').toLowerCase();
  return CATEGORY_ICONS[key] || '📦';
};

const ItemCard = ({ item, showItemDetail, statusInfo }) => {
  const isLost = item.type === 'lost';
  const badgeColor = isLost ? '#ef4444' : '#10b981';
  const badgeBg = isLost ? '#fee2e2' : '#d1fae5';
  const badgeText = isLost ? '🔴 Lost' : '🟢 Found';

  const date = isLost
    ? (item.dateLost ? formatDate(item.dateLost) : 'Date unknown')
    : (item.dateFound ? formatDate(item.dateFound) : 'Date unknown');

  return (
    <div className="col-md-6 col-lg-4">
      <div
        className="item-card-enhanced"
        onClick={() => showItemDetail('item-detail', item)}
        style={{ cursor: 'pointer' }}
      >
        <div className="item-card-img-wrap">
          {item.imageUrl ? (
            <img
              src={getImageUrl(item.imageUrl)}
              alt={item.title}
              className="item-card-img"
            />
          ) : (
            <div className="item-card-no-img">
              <span style={{ fontSize: '2.5rem' }}>{getCategoryIcon(item.category)}</span>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '6px' }}>No Image</span>
            </div>
          )}
          <span
            className="item-type-badge"
            style={{ background: badgeBg, color: badgeColor, border: `1px solid ${badgeColor}` }}
          >
            {statusInfo ? statusInfo.text : badgeText}
          </span>
        </div>

        <div className="item-card-body">
          <div className="item-card-header">
            <h5 className="item-card-title">{item.title}</h5>
            <span className="item-category-chip">
              {getCategoryIcon(item.category)} {capitalizeFirstLetter(item.category || 'Other')}
            </span>
          </div>

          <p className="item-card-desc">{truncateText(item.description, 90)}</p>

          <div className="item-card-meta">
            <span>📍 {item.location || 'Unknown'}</span>
            <span>📅 {date}</span>
          </div>

          <button className="item-card-btn">View Details →</button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
