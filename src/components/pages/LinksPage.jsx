export function LinksPage({ config, links }) {
  return (
    <main className="widePage glass">
      <header className="pageHead">
        <h2>{stripIcon(config.linksTitle)}</h2>
        <p>{config.linksSubtitle}</p>
      </header>
      <div className="linkGrid">
        {links.map((link, index) => (
          <a
            className="linkTile glassSoft"
            href={link.link}
            target="_blank"
            rel="noreferrer"
            key={String(index)}
          >
            <span>{renderSmartIcon(linkIcon(link.name, config))}</span>
            <b>{link.name}</b>
            <small>فتح الرابط</small>
          </a>
        ))}
      </div>
    </main>
  );
}
