# Temporary Render hosting until Vercel billing is restored.
#
# 1) Create API key: https://dashboard.render.com/u/*/settings#api-keys
# 2) In this chat, paste: RENDER_API_KEY=rnd_...
# 3) Or run: export RENDER_API_KEY=rnd_... && render login
#
# After deploy, point DNS:
#   novalyte.io  CNAME → novalyte-homepage.onrender.com  (or Render A/AAAA they show)
#   www          CNAME → novalyte-homepage.onrender.com
#   admin        CNAME → novalyte-admin.onrender.com
