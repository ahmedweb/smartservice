// js/google-form.js
(function () {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    const thankYouUrl = '/thank-you.html'; // changer si besoin
    const useFetchNoCors = true; // true = utilise fetch(..., {mode:'no-cors'}), false = iframe-only
  
    // Handler iframe: quand l'iframe se charge (après soumission), redirection vers thank-you
    const iframe = document.getElementById('hidden_iframe');
    let iframeLoaded = false;
    iframe.addEventListener('load', function () {
      // NOTE: on ne peut pas lire le contenu cross-origin, mais on sait que la soumission a été faite
      if (iframeLoaded) {
        window.location.href = thankYouUrl;
      }
    });
  
    form.addEventListener('submit', function (e) {
      // Allow normal submit if JS disabled (but here JS enabled)
      e.preventDefault();
  
      // Anti-spam honeypot check (not part of Google)
      const honeypot = form.querySelector('[name="honeypot"]');
      if (honeypot && honeypot.value) {
        status.textContent = 'Spam détecté.';
        return;
      }
  
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      status.textContent = 'Envoi en cours…';
  
      const formData = new FormData(form);
  
      // Option A : fetch no-cors (envoi opaque) — rapide, mais on ne peut pas lire la réponse
      if (useFetchNoCors && window.fetch) {
        const url = form.action;
  
        // Convertir FormData en application/x-www-form-urlencoded
        const params = new URLSearchParams();
        for (const pair of formData) params.append(pair[0], pair[1]);
  
        fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          body: params.toString()
        }).then(function () {
          // Avec no-cors la promesse résout même si la réponse est opaque.
          // On suppose le succès et on redirige vers la page de remerciement
          // délai court pour laisser le POST partir
          setTimeout(function () {
            window.location.href = thankYouUrl;
          }, 700);
        }).catch(function (err) {
          console.error('fetch no-cors erreur', err);
          status.textContent = 'Erreur réseau. Réessayez.';
          submitBtn.disabled = false;
        });
  
        return;
      }
  
      // Option B : fallback — utiliser la soumission normale en ciblant l'iframe cachée
      // On marque iframeLoaded pour que le handler load redirige (après la 1ère soumission)
      iframeLoaded = true;
      // Submit standard (POST) vers Google Forms, cible = iframe
      form.submit();
    });
  })();
  