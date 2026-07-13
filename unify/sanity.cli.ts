import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'fercgabp',
    dataset: 'production'
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/cli#auto-updates
     */
    autoUpdates: true,
    // Pin the existing studio app (unify.sanity.studio) so `sanity deploy`
    // doesn't prompt for a hostname/appId.
    appId: 'bdk3al61mfsxde3hhcu572v9',
  }
})
