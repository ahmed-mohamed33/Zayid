import { useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { useNotifications } from "../../hooks/useNotifications";
import routesMeta from "../../routesMeta";

export default function TitleUpdater() {
  const location = useLocation();
  const { auctions } = useContext(UserContext);
  const { unreadCount, hasNewNotifications } = useNotifications();

  useEffect(() => {
    let title = "ZAYID";
    let description = "منصة زيد للمزادات – احصل على أفضل الصفقات بسهولة وأمان.";
    const staticMeta = routesMeta[location.pathname];

    if (staticMeta) {
      title = `${staticMeta.title} | ZAYID`;
      description = staticMeta.description;
    } else if (location.pathname.startsWith("/auction/")) {
      const auctionId = location.pathname.split("/")[2] || "";
      if (auctionId && auctions.length > 0) {
        const auction = auctions.find((a) => a.id === auctionId);
        if (auction) {
          title = `${auction.title} | مزاد`;
        } else {
          title = "ZAYID";
          description = "تفاصيل هذا المزاد غير متوفرة حاليًا.";
        }
      } else {
        title = "ZAYID";
        description = "تفاصيل هذا المزاد غير متوفرة حاليًا.";
      }
    }
    // title
    const unreadPrefix =
      unreadCount > 0 ? `(${unreadCount > 99 ? "99+" : unreadCount}) ` : "";
    const ping = hasNewNotifications ? "• " : "";
    document.title = `${ping}${unreadPrefix}${title}`;
    //metaTag
    let metaTag = document.querySelector('meta[name="description"]');
    if (!metaTag) {
      metaTag = document.createElement("meta");
      metaTag.name = "description";
      document.head.appendChild(metaTag);
    }
    metaTag.content = description;
    // create meta keywords
    let keywordsTag = document.querySelector('meta[name="keywords"]');
    if (!keywordsTag) {
      keywordsTag = document.createElement("meta");
      keywordsTag.name = "keywords";
      document.head.appendChild(keywordsTag);
    }

    // our keywords
    keywordsTag.content =
      staticMeta?.keywords ||
      (auctions?.title
        ? ` مزاد, ZAYID, بيع, شراء`
        : "مزادات, بيع, شراء, ZAYID");
  }, [location, auctions, unreadCount, hasNewNotifications]);

  return null;
}