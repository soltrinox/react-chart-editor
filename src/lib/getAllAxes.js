import {TRACE_TO_AXIS} from 'lib/constants';
import {capitalize, striptags} from 'lib';

export default function getAllAxes(fullLayout) {
  const axes = [];
  // Plotly.js should really have a helper function for this, but until it does..
  if (fullLayout && fullLayout._subplots) {
    Object.keys(fullLayout._subplots)
      .filter(
        // xaxis and yaxis already included separately in _fullLayout._subplots
        type => type !== 'cartesian' && fullLayout._subplots[type].length !== 0
      )
      .forEach(type => {
        fullLayout._subplots[type].forEach(subplot => {
          if (['xaxis', 'yaxis'].includes(type)) {
            // subplot will look like x2, x45, convert it to xaxis2, xaxis45
            subplot = // eslint-disable-line no-param-reassign
              subplot.length > 1
                ? subplot.slice(0, 1) + 'axis' + subplot.slice(1)
                : subplot + 'axis';

            fullLayout[subplot]._subplot = subplot;
            fullLayout[subplot]._axisGroup = type;
            axes.push(fullLayout[subplot]);
          } else {
            Object.keys(fullLayout[subplot])
              .filter(key => key.includes('axis'))
              .forEach(axis => {
                fullLayout[subplot][axis]._subplot = subplot;
                fullLayout[subplot][axis]._axisGroup = type;

                // it should be in plotly.js, but it's not there for geo axes..
                if (!fullLayout[subplot][axis]._name) {
                  fullLayout[subplot][axis]._name = axis;
                }
                axes.push(fullLayout[subplot][axis]);
              });
          }
        });
      });
  }

  return axes;
}

export function traceTypeToAxisType(traceType) {
  let category = null;

  Object.keys(TRACE_TO_AXIS).forEach(c => {
    if (TRACE_TO_AXIS[c].includes(traceType)) {
      category = c;
    }
  });

  if (category) {
    return category;
  }

  if (traceType === 'pie') {
    return null;
  }

  if (traceType === 'table') {
    return null;
  }

  throw new Error(`Sorry, could not find ${traceType} in any category.`);
}

export function axisIdToAxisName(id) {
  return id.charAt(0) + 'axis' + id.slice(1);
}

function getSubplotNumber(axis) {
  const splitSubplot = axis._subplot
    ? axis._subplot.split(axis._axisGroup)
    : [];
  return splitSubplot[1] ? Number(splitSubplot[1]) : 0;
}

export function getAxisTitle(axis) {
  const axisType = capitalize(axis._name.split('axis')[0]);
  const subplotNb = getSubplotNumber(axis);

  return axis._input && axis._input.title
    ? striptags(`${axisType}: ${axis._input.title}`)
    : striptags(`${axisType} ${subplotNb === 0 ? 1 : subplotNb}`);
}
