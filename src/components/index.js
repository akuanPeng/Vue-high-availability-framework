import akReport from './report'
import akManage1 from './manage1'
import akManage2 from './manage2'
import akTree from './tree'
import akSelectTree from './selectTree'
import akSelectTree2 from './selectTree2'
import akBranch from './branch'

import xMind from './xMind'
import minTable from './minTable'
import resources from './resources'
import resultNew from './resultNew'
import scoring from './scoring'

export default {
    akReport,
    akSelectTree,
    akSelectTree2,
    akManage1,
    akManage2,
    akTree,
    akBranch,
    ...{
        minTable,
        xMind,
        resources,
        resultNew,
        scoring
    }
}
