## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FWaqasIshaque1%2Fp-cinevo)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/WaqasIshaque1/p-cinevo)

## Running Locally
```bash
git clone https://github.com/WaqasIshaque1/p-cinevo.git
cd p-cinevo
git pull
pnpm install
pnpm run dev
```
Then you can visit the local instance [here](http://localhost:5173) or, at local host on port 5173.


## Updating a P-Cinevo Instance
To update a P-Cinevo instance you can type the below commands into a terminal at the root of your project.
```bash
git remote add upstream https://github.com/WaqasIshaque1/p-cinevo.git
git fetch upstream # Grab the contents of the new remote source
git checkout <YOUR_MAIN_BRANCH>  # Most likely this would be `origin/production`
git merge upstream/production
# * Fix any conflicts present during merge *
git add .  # Add all changes made during merge and conflict fixing
git commit -m "Update p-cinevo instance (merge upstream/production)"
git push  # Push to YOUR repository
```
