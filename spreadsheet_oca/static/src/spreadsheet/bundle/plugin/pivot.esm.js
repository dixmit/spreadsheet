/** @odoo-module */

import {PivotCorePlugin} from "@spreadsheet/pivot/index";
import PivotDataSource from "@spreadsheet/pivot/pivot_data_source";
import spreadsheet from "@spreadsheet/o_spreadsheet/o_spreadsheet_extended";

const {coreTypes, invalidateEvaluationCommands} = spreadsheet;
const {corePluginRegistry, inverseCommandRegistry} = spreadsheet.registries;
// List depends on filter for its getters

console.log("Patching");

class PivotOCACorePlugin extends PivotCorePlugin {
    handle(cmd) {
        super.handle(cmd);
        switch (cmd.type) {
            case "UPDATE_ODOO_MODEL": {
                this.history.update(
                    "pivots",
                    cmd.pivotId,
                    "definition",
                    "metaData",
                    "resModel",
                    cmd.model
                );
                const pivot = this.pivots[cmd.pivotId];
                this.dataSources.add(
                    pivot.dataSourceId,
                    PivotDataSource,
                    pivot.definition
                );
                break;
            }
            case "UNDO":
            case "REDO": {
                const domainEditionCommands = cmd.commands.filter(
                    (cmdCmd) => cmdCmd.type === "UPDATE_ODOO_MODEL"
                );
                for (const domainCmd of domainEditionCommands) {
                    const pivot = this.pivots[domainCmd.pivotId];
                    this.dataSources.add(
                        pivot.dataSourceId,
                        PivotDataSource,
                        pivot.definition
                    );
                }
                break;
            }
        }
    }
}

function identity(cmd) {
    return [cmd];
}

coreTypes.add("UPDATE_ODOO_MODEL");

invalidateEvaluationCommands.add("UPDATE_ODOO_MODEL");

inverseCommandRegistry.add("UPDATE_ODOO_MODEL", identity);
corePluginRegistry.add("OdooPivotCorePlugin", PivotOCACorePlugin);

export {PivotOCACorePlugin};

/*
Class PivotOCACorePlugin extends CorePlugin {
    allowDispatch(cmd) {
        return CommandResult.Success;
    }

    handle(cmd) {
        switch (cmd.type) {
            case "UPDATE_ODOO_PIVOT": {
                this.history.update(
                    "pivots",
                    cmd.pivotId,
                    "definition",
                    cmd.definition
                );
                const pivot = this.pivots[cmd.pivotId];
                console.log(this, pivot, cmd)
                this.dataSources.add(pivot.dataSourceId, PivotDataSource, pivot.definition);
                break;
            }
            case "UNDO":
            case "REDO": {
                const domainEditionCommands = cmd.commands.filter(
                    (cmd) => cmd.type === "UPDATE_ODOO_PIVOT"
                );
                for (const cmd of domainEditionCommands) {
                    const pivot = this.pivots[cmd.pivotId];
                    this.dataSources.add(pivot.dataSourceId, PivotDataSource, pivot.definition);
                }
                break;
            }
        }
    }

}

PivotOCACorePlugin.getters = [];


function identity(cmd) {
    return [cmd];
}

coreTypes.add("UPDATE_ODOO_PIVOT");

invalidateEvaluationCommands.add("UPDATE_ODOO_PIVOT");

inverseCommandRegistry
    .add("UPDATE_ODOO_PIVOT", identity);
corePluginRegistry.add("OdooPivotOCACorePlugin", PivotOCACorePlugin);

export { PivotOCACorePlugin };

*/
