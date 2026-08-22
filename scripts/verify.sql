-- Identify partitions with broken nested set boundaries
WITH PartitionMetrics AS (
    SELECT 
        PartitionId,
        COUNT(*) AS TotalNodes,
        MIN([Left]) AS MinLeft,
        MAX([Right]) AS MaxRight,
        COUNT(DISTINCT [Left]) AS DistinctLefts,
        COUNT(DISTINCT [Right]) AS DistinctRights,
        SUM(CASE WHEN [Left] >= [Right] OR [Left] <= 0 OR [Right] <= 0 THEN 1 ELSE 0 END) AS InvalidNodeBounds
    FROM Node
    WHERE Deleted = 0
    GROUP BY PartitionId
),
CorruptedPartitions AS (
    SELECT 
        PartitionId,
        CASE 
            WHEN InvalidNodeBounds > 0 THEN 'Inverted or non-positive bounds (Left >= Right or <= 0)'
            WHEN MinLeft <> 1 THEN 'Starting boundary is not 1'
            WHEN MaxRight <> (TotalNodes * 2) THEN 'Max boundary does not equal 2 * NodeCount'
            WHEN DistinctLefts <> TotalNodes OR DistinctRights <> TotalNodes THEN 'Duplicate Left or Right values found'
            ELSE 'Unknown structural anomaly'
        END AS IssueReason
    FROM PartitionMetrics
    WHERE InvalidNodeBounds > 0
       OR MinLeft <> 1
       OR MaxRight <> (TotalNodes * 2)
       OR DistinctLefts <> TotalNodes
       OR DistinctRights <> TotalNodes
)
SELECT PartitionId, P.Label, IssueReason FROM CorruptedPartitions
JOIN [Partition] P on PartitionId = P.Id