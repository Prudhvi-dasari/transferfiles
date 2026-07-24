export function PrivacySection() {
  return (
    <section className="container-page py-12 border-t border-border/50 text-center">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Cloudwarden respects your privacy and is committed to protecting your infrastructure data. 
          Our agents operate with least-privilege access and never inspect customer payloads or application data. 
          All control plane traffic is TLS 1.3 encrypted, and audit logs are cryptographically sealed. 
          By using Cloudwarden, you agree to our Terms of Service and Data Processing Agreement.
        </p>
      </div>
    </section>
  );
}
