<section class="demo-section">
    <h2>Redes sociales</h2>

    <ul class="social-links">
    <li><a href="https://instagram.com/"
        target="_blank" rel="noopener noreferrer">Instagram</a></li>
    <li><a href="https://facebook.com/"
        target="_blank" rel="noopener noreferrer">Facebook</a></li>
    <li><a href="https://linkedin.com/"
        target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
    </ul>
</section>

<style>
    /* 6. REDES SOCIALES */

    .social-links {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      padding: 0;
      list-style: none;
    }

    .social-links a {
      display: inline-block;
      padding: 8px 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      text-decoration: none;
      background: white;
    }

        .demo-section {
            width: min(100%, 360px);
            margin: 0 auto;
            color: white;
            text-align: center;
        }

        .demo-section h2 {
            margin-bottom: 0.6rem;
            font-size: 0.9rem;
            font-weight: 600;
        }

        .social-links {
            justify-content: center;
            margin-bottom: 0;
        }

        .social-links a {
            color: white;
            border-color: rgb(255 255 255 / 30%);
            background: transparent;
            font-size: 0.8rem;
        }
</style>