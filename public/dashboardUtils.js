(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory()
  } else {
    root.QcDashboardUtils = factory()
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  /**
   * @typedef {Object} DataRow
   * @property {string} inspectorName
   * @property {string} inspectionStage
   * @property {string} inspectedDate
   * @property {number} inspectedQty
   * @property {number} passQty
   * @property {number} failQty
   * @property {number | null | undefined} quarantine
   * @property {string | null} defectCode
   * @property {string | null} defectOwner
   * @property {string} branchITW
   * @property {string} inspectorDept
   */

  /**
   * @typedef {Object} DashboardFilters
   * @property {string | Date | null | undefined} [startDate]
   * @property {string | Date | null | undefined} [endDate]
   * @property {string[]} [inspectionStages]
   * @property {string} [branch]
   * @property {string} [inspectorDept]
   * @property {string[]} [defectOwners]
   */

  function toFiniteNumber(value, fallback) {
    var resolvedFallback = typeof fallback === 'number' ? fallback : 0
    if (value === null || value === undefined || value === '') return resolvedFallback
    var numericValue = Number(value)
    return Number.isFinite(numericValue) ? numericValue : resolvedFallback
  }

  function normalizeText(value) {
    return value === null || value === undefined ? '' : String(value).trim()
  }

  function parseDate(value) {
    if (value === null || value === undefined || value === '') return null
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
    var parsedDate = new Date(value)
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
  }

  function toDateKey(value) {
    var parsedDate = parseDate(value)
    return parsedDate ? parsedDate.toISOString().slice(0, 10) : ''
  }

  function roundToTwo(value) {
    return Math.round(value * 100) / 100
  }

  function getNormalizedDateForFilter(value) {
    var parsedDate = parseDate(value)
    return parsedDate ? parsedDate.toISOString().slice(0, 10) : ''
  }

  /**
   * Filter rows by the active dashboard filters.
   * @param {DataRow[]} data
   * @param {DashboardFilters} [filters]
   * @returns {DataRow[]}
   */
  function filterData(data, filters) {
    var sourceData = Array.isArray(data) ? data : []
    var resolvedFilters = filters || {}
    var startDateKey = getNormalizedDateForFilter(resolvedFilters.startDate)
    var endDateKey = getNormalizedDateForFilter(resolvedFilters.endDate)
    var inspectionStages = new Set((resolvedFilters.inspectionStages || []).map(normalizeText).filter(Boolean))
    var defectOwners = new Set((resolvedFilters.defectOwners || []).map(normalizeText).filter(Boolean))
    var branch = normalizeText(resolvedFilters.branch)
    var inspectorDept = normalizeText(resolvedFilters.inspectorDept)

    return sourceData.filter(function (row) {
      var rowDateKey = getNormalizedDateForFilter(row.inspectedDate)
      if (startDateKey && (!rowDateKey || rowDateKey < startDateKey)) return false
      if (endDateKey && (!rowDateKey || rowDateKey > endDateKey)) return false
      if (inspectionStages.size > 0 && !inspectionStages.has(normalizeText(row.inspectionStage))) return false
      if (branch && normalizeText(row.branchITW) !== branch) return false
      if (inspectorDept && normalizeText(row.inspectorDept) !== inspectorDept) return false
      if (defectOwners.size > 0) {
        var defectOwner = normalizeText(row.defectOwner)
        if (!defectOwner || !defectOwners.has(defectOwner)) return false
      }
      return true
    })
  }

  /**
   * Aggregate the filtered data into KPI metrics.
   * @param {DataRow[]} filteredData
   * @returns {{ totalInspectedQty: number, passRatePct: number | null, failRatePct: number | null, quarantineRatePct: number | null, passQty: number, failQty: number, quarantineQty: number }}
   */
  function getQualityOverviewMetrics(filteredData) {
    var sourceData = Array.isArray(filteredData) ? filteredData : []
    var totalInspectedQty = 0
    var passQty = 0
    var failQty = 0
    var quarantineQty = 0

    sourceData.forEach(function (row) {
      totalInspectedQty += toFiniteNumber(row.inspectedQty, 0)
      passQty += toFiniteNumber(row.passQty, 0)
      failQty += toFiniteNumber(row.failQty, 0)
      quarantineQty += toFiniteNumber(row.quarantine, 0)
    })

    if (totalInspectedQty <= 0) {
      return {
        totalInspectedQty: 0,
        passRatePct: null,
        failRatePct: null,
        quarantineRatePct: null,
        passQty: passQty,
        failQty: failQty,
        quarantineQty: quarantineQty,
      }
    }

    return {
      totalInspectedQty: totalInspectedQty,
      passRatePct: roundToTwo((passQty / totalInspectedQty) * 100),
      failRatePct: roundToTwo((failQty / totalInspectedQty) * 100),
      quarantineRatePct: roundToTwo((quarantineQty / totalInspectedQty) * 100),
      passQty: passQty,
      failQty: failQty,
      quarantineQty: quarantineQty,
    }
  }

  /**
   * Aggregate fail rate by week or month for the trend line chart.
   * @param {DataRow[]} filteredData
   * @param {'week' | 'month'} [period]
   * @returns {{ periodLabel: string, inspectedQty: number, failQty: number, failRatePct: number | null, periodStart: string }[]}
   */
  function aggregateTrendByPeriod(filteredData, period) {
    var sourceData = Array.isArray(filteredData) ? filteredData : []
    var granularity = period === 'month' ? 'month' : 'week'
    var groups = new Map()

    sourceData.forEach(function (row) {
      var inspectedQty = toFiniteNumber(row.inspectedQty, 0)
      if (inspectedQty <= 0) return

      var parsedDate = parseDate(row.inspectedDate)
      if (!parsedDate) return

      var periodStartDate = new Date(Date.UTC(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate()))
      if (granularity === 'week') {
        var dayOfWeek = periodStartDate.getUTCDay()
        var offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
        periodStartDate.setUTCDate(periodStartDate.getUTCDate() + offset)
      } else {
        periodStartDate = new Date(Date.UTC(periodStartDate.getUTCFullYear(), periodStartDate.getUTCMonth(), 1))
      }

      var periodStartKey = periodStartDate.toISOString().slice(0, 10)
      var existingGroup = groups.get(periodStartKey)
      if (!existingGroup) {
        existingGroup = {
          periodLabel: granularity === 'week'
            ? 'Week of ' + periodStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : periodStartDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          inspectedQty: 0,
          failQty: 0,
          failRatePct: null,
          periodStart: periodStartKey,
        }
        groups.set(periodStartKey, existingGroup)
      }

      existingGroup.inspectedQty += inspectedQty
      existingGroup.failQty += toFiniteNumber(row.failQty, 0)
    })

    return Array.from(groups.values())
      .sort(function (left, right) {
        return left.periodStart.localeCompare(right.periodStart)
      })
      .map(function (group) {
        return {
          periodLabel: group.periodLabel,
          inspectedQty: group.inspectedQty,
          failQty: group.failQty,
          failRatePct: group.inspectedQty > 0 ? roundToTwo((group.failQty / group.inspectedQty) * 100) : null,
          periodStart: group.periodStart,
        }
      })
  }

  /**
   * Aggregate fail rate by inspection stage.
   * Stages with zero inspected quantity are excluded from the output.
   * @param {DataRow[]} filteredData
   * @returns {{ stage: string, inspectedQty: number, failQty: number, failRatePct: number }[]}
   */
  function aggregateByStage(filteredData) {
    var sourceData = Array.isArray(filteredData) ? filteredData : []
    var groupedStages = new Map()

    sourceData.forEach(function (row) {
      var stageName = normalizeText(row.inspectionStage) || 'Unknown'
      var inspectedQty = toFiniteNumber(row.inspectedQty, 0)
      var failQty = toFiniteNumber(row.failQty, 0)
      var existingStage = groupedStages.get(stageName)
      if (!existingStage) {
        existingStage = { stage: stageName, inspectedQty: 0, failQty: 0 }
        groupedStages.set(stageName, existingStage)
      }
      existingStage.inspectedQty += inspectedQty
      existingStage.failQty += failQty
    })

    return Array.from(groupedStages.values())
      .filter(function (stage) {
        return stage.inspectedQty > 0
      })
      .map(function (stage) {
        return {
          stage: stage.stage,
          inspectedQty: stage.inspectedQty,
          failQty: stage.failQty,
          failRatePct: roundToTwo((stage.failQty / stage.inspectedQty) * 100),
        }
      })
      .sort(function (left, right) {
        if (right.failRatePct !== left.failRatePct) {
          return right.failRatePct - left.failRatePct
        }
        return left.stage.localeCompare(right.stage)
      })
  }

  /**
   * Aggregate fail rate by inspector.
   * Inspectors below the minimum sample size keep a null fail rate.
   * @param {DataRow[]} filteredData
   * @param {number} [minSampleSize=500]
   * @returns {{ inspectorName: string, inspectedQty: number, failRatePct: number | null, sufficientSample: boolean, failQty: number }[]}
   */
  function aggregateByInspector(filteredData, minSampleSize) {
    var sourceData = Array.isArray(filteredData) ? filteredData : []
    var resolvedMinSampleSize = typeof minSampleSize === 'number' ? minSampleSize : 500
    var groupedInspectors = new Map()

    sourceData.forEach(function (row) {
      var inspectorName = normalizeText(row.inspectorName) || 'Unknown'
      var inspectedQty = toFiniteNumber(row.inspectedQty, 0)
      var failQty = toFiniteNumber(row.failQty, 0)
      var existingInspector = groupedInspectors.get(inspectorName)
      if (!existingInspector) {
        existingInspector = { inspectorName: inspectorName, inspectedQty: 0, failQty: 0 }
        groupedInspectors.set(inspectorName, existingInspector)
      }
      existingInspector.inspectedQty += inspectedQty
      existingInspector.failQty += failQty
    })

    return Array.from(groupedInspectors.values())
      .map(function (inspector) {
        var sufficientSample = inspector.inspectedQty >= resolvedMinSampleSize && inspector.inspectedQty > 0
        return {
          inspectorName: inspector.inspectorName,
          inspectedQty: inspector.inspectedQty,
          failQty: inspector.failQty,
          failRatePct: sufficientSample ? roundToTwo((inspector.failQty / inspector.inspectedQty) * 100) : null,
          sufficientSample: sufficientSample,
        }
      })
      .sort(function (left, right) {
        if (right.inspectedQty !== left.inspectedQty) {
          return right.inspectedQty - left.inspectedQty
        }
        return left.inspectorName.localeCompare(right.inspectorName)
      })
  }

  /**
   * Build Pareto data from fail quantities grouped by defect code.
   * Null defect codes are excluded before grouping.
   * @param {DataRow[]} filteredData
   * @param {number} [topN=10]
   * @returns {{ defectCode: string, failQty: number, cumulativePct: number }[]}
   */
  function getParetoData(filteredData, topN) {
    var sourceData = Array.isArray(filteredData) ? filteredData : []
    var resolvedTopN = typeof topN === 'number' ? topN : 10
    var groupedDefects = new Map()

    sourceData.forEach(function (row) {
      var defectCode = normalizeText(row.defectCode)
      if (!defectCode) return
      var failQty = toFiniteNumber(row.failQty, 0)
      groupedDefects.set(defectCode, (groupedDefects.get(defectCode) || 0) + failQty)
    })

    var rankedDefects = Array.from(groupedDefects.entries())
      .filter(function (entry) {
        return entry[1] > 0
      })
      .sort(function (left, right) {
        if (right[1] !== left[1]) {
          return right[1] - left[1]
        }
        return left[0].localeCompare(right[0])
      })
    var totalFailQty = rankedDefects.reduce(function (sum, entry) {
      return sum + entry[1]
    }, 0)

    rankedDefects = rankedDefects.slice(0, resolvedTopN)

    if (totalFailQty <= 0) {
      return []
    }

    var cumulativeQty = 0
    return rankedDefects.map(function (entry) {
      cumulativeQty += entry[1]
      return {
        defectCode: entry[0],
        failQty: entry[1],
        cumulativePct: roundToTwo((cumulativeQty / totalFailQty) * 100),
      }
    })
  }

  /**
   * Calculate a percentile from a list of numbers.
   * @param {number[]} values
   * @param {number} percentile
   * @returns {number | null}
   */
  function getPercentile(values, percentile) {
    var numericValues = Array.isArray(values) ? values.filter(function (value) {
      return Number.isFinite(value)
    }) : []

    if (numericValues.length === 0) return null

    var clampedPercentile = Math.min(100, Math.max(0, percentile))
    var sortedValues = numericValues.slice().sort(function (left, right) {
      return left - right
    })

    if (sortedValues.length === 1) {
      return sortedValues[0]
    }

    var position = (sortedValues.length - 1) * (clampedPercentile / 100)
    var lowerIndex = Math.floor(position)
    var upperIndex = Math.ceil(position)

    if (lowerIndex === upperIndex) {
      return sortedValues[lowerIndex]
    }

    var lowerWeight = upperIndex - position
    var upperWeight = position - lowerIndex
    return roundToTwo((sortedValues[lowerIndex] * lowerWeight) + (sortedValues[upperIndex] * upperWeight))
  }

  return {
    filterData: filterData,
    getQualityOverviewMetrics: getQualityOverviewMetrics,
    aggregateTrendByPeriod: aggregateTrendByPeriod,
    aggregateByStage: aggregateByStage,
    aggregateByInspector: aggregateByInspector,
    getParetoData: getParetoData,
    getPercentile: getPercentile,
    toFiniteNumber: toFiniteNumber,
    parseDate: parseDate,
    toDateKey: toDateKey,
  }
})