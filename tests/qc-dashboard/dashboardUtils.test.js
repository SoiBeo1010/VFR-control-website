const test = require('node:test')
const assert = require('node:assert/strict')

const {
  filterData,
  getQualityOverviewMetrics,
  aggregateTrendByPeriod,
  aggregateByStage,
  aggregateByInspector,
  getParetoData,
  getPercentile,
} = require('../../public/dashboardUtils.js')

const sampleData = [
  {
    inspectorName: 'Alice',
    inspectionStage: 'Final',
    inspectedDate: '2026-06-01T08:00:00.000Z',
    inspectedQty: 100,
    passQty: 95,
    failQty: 5,
    quarantine: null,
    defectCode: 'D01',
    defectOwner: 'Owner A',
    branchITW: 'North',
    inspectorDept: 'QA',
  },
  {
    inspectorName: 'Alice',
    inspectionStage: 'Sanding',
    inspectedDate: '2026-06-08T08:00:00.000Z',
    inspectedQty: 0,
    passQty: 0,
    failQty: 2,
    quarantine: undefined,
    defectCode: null,
    defectOwner: null,
    branchITW: 'North',
    inspectorDept: 'QA',
  },
  {
    inspectorName: 'Bob',
    inspectionStage: 'Assembly',
    inspectedDate: '2026-06-15T08:00:00.000Z',
    inspectedQty: 600,
    passQty: 580,
    failQty: 20,
    quarantine: 1,
    defectCode: 'D02',
    defectOwner: 'Owner B',
    branchITW: 'South',
    inspectorDept: 'QC',
  },
  {
    inspectorName: 'Bob',
    inspectionStage: 'Assembly',
    inspectedDate: '2026-07-01T08:00:00.000Z',
    inspectedQty: 400,
    passQty: 390,
    failQty: 10,
    quarantine: 0,
    defectCode: 'D02',
    defectOwner: 'Owner B',
    branchITW: 'South',
    inspectorDept: 'QC',
  },
  {
    inspectorName: 'Carol',
    inspectionStage: 'Assembly',
    inspectedDate: '2026-07-02T08:00:00.000Z',
    inspectedQty: 250,
    passQty: 245,
    failQty: 5,
    quarantine: 0,
    defectCode: 'D03',
    defectOwner: null,
    branchITW: 'South',
    inspectorDept: 'Assembly',
  },
]

test('filterData applies time, stage, branch, department, and defect owner filters', () => {
  const filtered = filterData(sampleData, {
    startDate: '2026-06-10',
    endDate: '2026-07-01',
    inspectionStages: ['Assembly'],
    branch: 'South',
    inspectorDept: 'QC',
    defectOwners: ['Owner B'],
  })

  assert.equal(filtered.length, 2)
  assert.deepEqual(filtered.map((row) => row.inspectorName), ['Bob', 'Bob'])
})

test('getQualityOverviewMetrics treats missing quarantine as zero and guards zero totals', () => {
  const metrics = getQualityOverviewMetrics(sampleData)

  assert.equal(metrics.totalInspectedQty, 1350)
  assert.equal(metrics.passQty, 1310)
  assert.equal(metrics.failQty, 42)
  assert.equal(metrics.quarantineQty, 1)
  assert.equal(metrics.passRatePct, 97.04)
  assert.equal(metrics.failRatePct, 3.11)
  assert.equal(metrics.quarantineRatePct, 0.07)

  const emptyMetrics = getQualityOverviewMetrics([])
  assert.equal(emptyMetrics.totalInspectedQty, 0)
  assert.equal(emptyMetrics.passRatePct, null)
  assert.equal(emptyMetrics.failRatePct, null)
  assert.equal(emptyMetrics.quarantineRatePct, null)
})

test('aggregateTrendByPeriod groups by week or month and ignores zero-sample rows', () => {
  const weekly = aggregateTrendByPeriod(sampleData, 'week')

  assert.ok(weekly.length >= 2)
  assert.ok(weekly.every((point) => point.failRatePct === null || Number.isFinite(point.failRatePct)))
  assert.ok(weekly.every((point) => point.inspectedQty > 0))
})

test('aggregateByStage excludes zero inspected stages and computes fail rate', () => {
  const stages = aggregateByStage(sampleData)

  assert.equal(stages.some((stage) => stage.stage === 'Sanding'), false)
  assert.equal(stages[0].stage, 'Final')
  assert.equal(stages[0].failRatePct, 5)
  assert.ok(stages.every((stage) => Number.isFinite(stage.failRatePct)))
})

test('aggregateByInspector marks insufficient sample and returns fail rate only above threshold', () => {
  const inspectors = aggregateByInspector(sampleData, 500)
  const bob = inspectors.find((inspector) => inspector.inspectorName === 'Bob')
  const alice = inspectors.find((inspector) => inspector.inspectorName === 'Alice')
  const carol = inspectors.find((inspector) => inspector.inspectorName === 'Carol')

  assert.ok(bob)
  assert.equal(bob.inspectedQty, 1000)
  assert.equal(bob.failRatePct, 3)
  assert.equal(bob.sufficientSample, true)

  assert.ok(alice)
  assert.equal(alice.inspectedQty, 100)
  assert.equal(alice.failRatePct, null)
  assert.equal(alice.sufficientSample, false)

  assert.ok(carol)
  assert.equal(carol.inspectedQty, 250)
  assert.equal(carol.failRatePct, null)
  assert.equal(carol.sufficientSample, false)
})

test('getParetoData excludes null defect codes and calculates cumulative percentage', () => {
  const pareto = getParetoData(sampleData, 10)

  assert.equal(pareto.some((item) => item.defectCode === null), false)
  assert.deepEqual(pareto.map((item) => item.defectCode), ['D02', 'D01', 'D03'])
  assert.equal(pareto[0].cumulativePct, 75)
  assert.equal(pareto[pareto.length - 1].cumulativePct, 100)
})

test('getPercentile returns the requested percentile with interpolation', () => {
  assert.equal(getPercentile([1, 2, 3, 4, 5], 90), 4.6)
  assert.equal(getPercentile([], 90), null)
})