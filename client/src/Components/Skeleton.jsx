import React from "react";
import "./Skeleton.css";

export const CardSkeleton = () => (
  <div className="skeleton-card">
    <div className="skeleton-header">
      <div className="skeleton-avatar"></div>
      <div className="skeleton-text-block">
        <div className="skeleton-text skeleton-title"></div>
        <div className="skeleton-text skeleton-subtitle"></div>
      </div>
    </div>
    <div className="skeleton-content">
      <div className="skeleton-text"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-text skeleton-short"></div>
    </div>
    <div className="skeleton-footer">
      <div className="skeleton-button"></div>
      <div className="skeleton-button"></div>
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="skeleton-profile">
    <div className="skeleton-header-banner"></div>
    <div className="skeleton-profile-info">
      <div className="skeleton-avatar-lg"></div>
      <div className="skeleton-text-block">
        <div className="skeleton-text skeleton-title"></div>
        <div className="skeleton-text skeleton-subtitle"></div>
        <div className="skeleton-text skeleton-short"></div>
      </div>
    </div>
    <div className="skeleton-stats">
      <div className="skeleton-stat"></div>
      <div className="skeleton-stat"></div>
      <div className="skeleton-stat"></div>
    </div>
  </div>
);

export const UserListSkeleton = () => (
  <div className="skeleton-list">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="skeleton-list-item">
        <div className="skeleton-avatar"></div>
        <div className="skeleton-text-block">
          <div className="skeleton-text skeleton-title"></div>
          <div className="skeleton-text skeleton-subtitle"></div>
        </div>
      </div>
    ))}
  </div>
);

export const ProjectSkeleton = () => (
  <div className="skeleton-project">
    <div className="skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton-text skeleton-title"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-text skeleton-short"></div>
      <div className="skeleton-tags">
        <div className="skeleton-tag"></div>
        <div className="skeleton-tag"></div>
        <div className="skeleton-tag"></div>
      </div>
    </div>
  </div>
);
